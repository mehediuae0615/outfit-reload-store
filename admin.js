
const $ = s => document.querySelector(s);
const read = (k, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(k) || "null") ?? fallback;
  } catch {
    return fallback;
  }
};

let products = [];
let orders = read("mf_orders", []);
let categories = [];

function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  setTimeout(() => $("#toast").classList.remove("show"), 3000);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

async function loadProducts() {
  const { data: categoryData, error: categoryError } =
    await supabaseClient.from("categories").select("id,name");

  if (categoryError) throw categoryError;
  categories = categoryData || [];

  const { data, error } = await supabaseClient
    .from("products")
    .select(`
      id,name,description,price,image_url,tag,active,created_at,
      category:categories(name),
      variants:product_variants(size,color,stock)
    `)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  products = (data || []).map(p => {
    const category = Array.isArray(p.category)
      ? p.category[0]
      : p.category;

    const variants = p.variants || [];

    return {
      id: p.id,
      name: p.name,
      category: category?.name || "Shirts",
      price: Number(p.price),
      image: p.image_url || "",
      description: p.description || "",
      tag: p.tag || "",
      sizes: [...new Set(variants.map(v => v.size).filter(Boolean))],
      colors: [...new Set(variants.map(v => v.color).filter(Boolean))]
    };
  });
}

async function refresh() {
  try {
    await loadProducts();
  } catch (error) {
    toast("Database error: " + error.message);
    return;
  }

  orders = read("mf_orders", []);

  $("#statProducts").textContent = products.length;
  $("#statOrders").textContent = orders.length;
  $("#statSales").textContent =
    "AED " + orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  $("#statCategories").textContent =
    new Set(products.map(p => p.category)).size;
  $("#orderBadge").textContent = orders.length;

  $("#productsTable").innerHTML = products.map(p => `
    <tr>
      <td>
        <div class="product-cell">
          <img src="${escapeHTML(p.image)}" alt="">
          <b>${escapeHTML(p.name)}</b>
        </div>
      </td>
      <td>${escapeHTML(p.category)}</td>
      <td>AED ${p.price}</td>
      <td>${escapeHTML(p.tag || "—")}</td>
      <td>
        <button data-edit="${p.id}">EDIT</button>
        <button data-delete="${p.id}">DELETE</button>
      </td>
    </tr>
  `).join("");

  $("#ordersTable").innerHTML = orders.length
    ? orders.map(o => `
      <tr>
        <td><b>${escapeHTML(o.id)}</b></td>
        <td>${escapeHTML(o.customer || "—")}<br>${escapeHTML(o.phone || "")}</td>
        <td>${escapeHTML(o.items || "—")}</td>
        <td>AED ${Number(o.total || 0)}</td>
        <td>${o.date ? new Date(o.date).toLocaleDateString() : "—"}</td>
        <td><span class="status">${escapeHTML(o.status || "Pending")}</span></td>
      </tr>
    `).join("")
    : '<tr><td colspan="6">No orders saved yet.</td></tr>';

  $("#recentOrders").innerHTML = orders.length
    ? `<div class="table-wrap"><table>
        <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>TOTAL</th><th>DATE</th></tr></thead>
        <tbody>${orders.slice(-5).reverse().map(o => `
          <tr>
            <td>${escapeHTML(o.id)}</td>
            <td>${escapeHTML(o.customer || "—")}</td>
            <td>AED ${Number(o.total || 0)}</td>
            <td>${o.date ? new Date(o.date).toLocaleDateString() : "—"}</td>
          </tr>
        `).join("")}</tbody>
      </table></div>`
    : '<p class="muted">No orders yet.</p>';

  document.querySelectorAll("[data-edit]").forEach(button => {
    button.onclick = () => editProduct(button.dataset.edit);
  });

  document.querySelectorAll("[data-delete]").forEach(button => {
    button.onclick = () => deleteProduct(button.dataset.delete);
  });
}

async function getCategoryId(name) {
  let category = categories.find(c => c.name === name);

  if (category) return category.id;

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const { data, error } = await supabaseClient
    .from("categories")
    .insert({ name, slug })
    .select("id,name")
    .single();

  if (error) throw error;

  categories.push(data);
  return data.id;
}

async function saveVariants(productId, sizes, colors) {
  const { data: existing, error } = await supabaseClient
    .from("product_variants")
    .select("id,size,color,stock")
    .eq("product_id", productId);

  if (error) throw error;

  const oldVariants = existing || [];
  const desired = [];

  sizes.forEach(size => {
    colors.forEach(color => {
      const old = oldVariants.find(v =>
        v.size === size && v.color === color
      );

      desired.push({
        product_id: productId,
        size,
        color,
        stock: old ? old.stock : 10
      });
    });
  });

  const oldKeys = new Set(
    desired.map(v => `${v.size}|${v.color}`)
  );

  const toDelete = oldVariants
    .filter(v => !oldKeys.has(`${v.size}|${v.color}`))
    .map(v => v.id);

  const newVariants = desired.filter(v =>
    !oldVariants.some(old =>
      old.size === v.size && old.color === v.color
    )
  );

  if (newVariants.length) {
    const { error: insertError } = await supabaseClient
      .from("product_variants")
      .insert(newVariants);

    if (insertError) throw insertError;
  }

  if (toDelete.length) {
    const { error: deleteError } = await supabaseClient
      .from("product_variants")
      .delete()
      .in("id", toDelete);

    if (deleteError) throw deleteError;
  }
}

function showApp() {
  $("#loginScreen").classList.add("hidden");
  $("#app").classList.remove("hidden");
  refresh();
}

$("#loginForm").onsubmit = async event => {
  event.preventDefault();

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: $("#email").value.trim(),
    password: $("#password").value
  });

  if (error) {
    toast("Login failed: " + error.message);
    return;
  }

  const { data, error: adminError } =
    await supabaseClient.rpc("is_admin");

  if (adminError || data !== true) {
    await supabaseClient.auth.signOut();
    toast("You are not an authorized admin");
    return;
  }

  showApp();
};

async function checkAdminSession() {
  const { data: { session } } =
    await supabaseClient.auth.getSession();

  if (!session) return;

  const { data, error } = await supabaseClient.rpc("is_admin");

  if (!error && data === true) {
    showApp();
  } else {
    await supabaseClient.auth.signOut();
  }
}

checkAdminSession();

$("#logout").onclick = async () => {
  await supabaseClient.auth.signOut();
  location.reload();
};

function go(page) {
  document.querySelectorAll(".page").forEach(p =>
    p.classList.add("hidden")
  );

  $("#" + page + "Page").classList.remove("hidden");

  document.querySelectorAll(".nav").forEach(button =>
    button.classList.toggle("active", button.dataset.page === page)
  );

  $("#pageTitle").textContent = {
    overview: "Overview",
    products: "Products",
    orders: "Orders",
    settings: "Store settings"
  }[page];
}

document.querySelectorAll(".nav").forEach(button => {
  button.onclick = () => go(button.dataset.page);
});

document.querySelectorAll("[data-goto]").forEach(button => {
  button.onclick = () => go(button.dataset.goto);
});

function openEditor() {
  $("#productEditor").classList.add("open");
}

function closeEditor() {
  $("#productEditor").classList.remove("open");
}

$("#addProductBtn").onclick = () => {
  $("#productForm").reset();
  $("#productId").value = "";
  $("#editorTitle").textContent = "Add product";
  $("#pSizes").value = "S,M,L,XL";
  $("#pColors").value = "#000000,#ffffff";
  openEditor();
};

function editProduct(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  $("#productId").value = p.id;
  $("#pName").value = p.name;
  $("#pCategory").value = p.category;
  $("#pPrice").value = p.price;
  $("#pImage").value = p.image;
  $("#pDescription").value = p.description;
  $("#pSizes").value = p.sizes.join(",");
  $("#pColors").value = p.colors.join(",");
  $("#pTag").value = p.tag;

  $("#editorTitle").textContent = "Edit product";
  openEditor();
}

async function deleteProduct(id) {
  if (!confirm("Remove this product from the store?")) return;

  const { error } = await supabaseClient
    .from("products")
    .update({ active: false })
    .eq("id", id);

  if (error) {
    toast("Delete failed: " + error.message);
    return;
  }

  await refresh();
  toast("Product removed");
}

$("#closeEditor").onclick = closeEditor;
$("#cancelEditor").onclick = closeEditor;

$("#productForm").onsubmit = async event => {
  event.preventDefault();

  const id = $("#productId").value;

  const name = $("#pName").value.trim();
  const category = $("#pCategory").value;
  const price = Number($("#pPrice").value);
  const image = $("#pImage").value.trim();
  const description = $("#pDescription").value.trim();
  const tag = $("#pTag").value.trim();

  const sizes = [...new Set(
    $("#pSizes").value.split(",").map(x => x.trim()).filter(Boolean)
  )];

  const colors = [...new Set(
    $("#pColors").value.split(",").map(x => x.trim()).filter(Boolean)
  )];

  if (!sizes.length || !colors.length) {
    toast("Please enter at least one size and one colour");
    return;
  }

  try {
    const categoryId = await getCategoryId(category);

    const productData = {
      name,
      category_id: categoryId,
      price,
      image_url: image,
      description,
      tag,
      active: true
    };

    let productId = id;

    if (id) {
      const { error } = await supabaseClient
        .from("products")
        .update(productData)
        .eq("id", id);

      if (error) throw error;
    } else {
      const { data, error } = await supabaseClient
        .from("products")
        .insert(productData)
        .select("id")
        .single();

      if (error) throw error;
      productId = data.id;
    }

    await saveVariants(productId, sizes, colors);

    closeEditor();
    await refresh();
    toast("Product saved to Supabase!");
  } catch (error) {
    toast("Save failed: " + error.message);
  }
};

$("#clearOrders").onclick = () => {
  if (confirm("Clear all demo orders on this device?")) {
    orders = [];
    localStorage.setItem("mf_orders", JSON.stringify(orders));
    refresh();
  }
};

$("#settingsForm").onsubmit = event => {
  event.preventDefault();

  localStorage.setItem("or_brand", $("#brandName").value);
  localStorage.setItem("or_whatsapp", $("#whatsapp").value.replace(/\D/g, ""));
  localStorage.setItem("or_currency", $("#currency").value);
  localStorage.setItem("or_mobile", $("#mobile").value.trim());
  localStorage.setItem("or_facebook", $("#facebook").value.trim());
  localStorage.setItem("or_tiktok", $("#tiktok").value.trim());

  toast("Settings saved");
};

$("#brandName").value = localStorage.getItem("or_brand") || "OUTFIT RELOAD";
$("#whatsapp").value = localStorage.getItem("or_whatsapp") || "8801404609228";
$("#mobile").value = localStorage.getItem("or_mobile") || "01404609228";
$("#facebook").value = localStorage.getItem("or_facebook") || "https://www.facebook.com/mehedi.hasan.santo.0615";
$("#tiktok").value = localStorage.getItem("or_tiktok") || "@mehedihasan0615";
