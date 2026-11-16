const $=s=>document.querySelector(s);const read=(k,f)=>JSON.parse(localStorage.getItem(k)||'null')??f;let products=loadStoreProducts();let orders=read('or_orders',[]);function save(){localStorage.setItem('or_products',JSON.stringify(products));localStorage.setItem('or_orders',JSON.stringify(orders))}function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),2200)}function showApp(){ $('#loginScreen').classList.add('hidden');$('#app').classList.remove('hidden');refresh() }$('#loginForm').onsubmit = async e => {
  e.preventDefault();

  const email = $('#email').value.trim();
  const password = $('#password').value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    toast('Login failed: ' + error.message);
    return;
  }

  const { data: isAdmin, error: adminError } =
    await supabaseClient.rpc('is_admin');

  if (adminError || isAdmin !== true) {
    await supabaseClient.auth.signOut();
    toast('You are not an authorized admin');
    return;
  }

  showApp();
};

async function checkAdminSession() {
  const { data: { session } } =
    await supabaseClient.auth.getSession();

  if (!session) return;

  const { data, error } = await supabaseClient.rpc('is_admin');

  if (!error && data === true) {
    showApp();
  } else {
    await supabaseClient.auth.signOut();
  }
}

checkAdminSession();

$('#logout').onclick = async () => {
  await supabaseClient.auth.signOut();
  location.reload();
};function go(page){document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));$('#'+page+'Page').classList.remove('hidden');document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active',b.dataset.page===page));$('#pageTitle').textContent=({overview:'Overview',products:'Products',orders:'Orders',settings:'Store settings'})[page]}document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>go(b.dataset.page));document.querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>go(b.dataset.goto));function refresh(){products=read('or_products',products);orders=read('mf_orders',orders);$('#statProducts').textContent=products.length;$('#statOrders').textContent=orders.length;$('#statSales').textContent='AED '+orders.reduce((s,o)=>s+Number(o.total||0),0);$('#statCategories').textContent=new Set(products.map(p=>p.category)).size;$('#orderBadge').textContent=orders.length;$('#productsTable').innerHTML=products.map(p=>`<tr><td><div class="product-cell"><img src="${p.image}"><b>${p.name}</b></div></td><td>${p.category}</td><td>AED ${p.price}</td><td>${p.tag||'—'}</td><td><button data-edit="${p.id}">EDIT</button><button data-delete="${p.id}">DELETE</button></td></tr>`).join('');$('#ordersTable').innerHTML=orders.length?orders.map(o=>`<tr><td><b>${o.id}</b></td><td>${o.customer||'—'}<br>${o.phone||''}</td><td>${o.items||'—'}</td><td>AED ${o.total}</td><td>${new Date(o.date).toLocaleDateString()}</td><td><span class="status">${o.status||'Pending'}</span></td></tr>`).join(''):'<tr><td colspan="6">No orders saved yet.</td></tr>';$('#recentOrders').innerHTML=orders.length?`<div class="table-wrap"><table><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>TOTAL</th><th>DATE</th></tr></thead><tbody>${orders.slice(-5).reverse().map(o=>`<tr><td>${o.id}</td><td>${o.customer||'—'}</td><td>AED ${o.total}</td><td>${new Date(o.date).toLocaleDateString()}</td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">No orders yet. Customer orders will appear here when submitted through the connected checkout.</p>';document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editProduct(b.dataset.edit));document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{if(confirm('Delete this product?')){products=products.filter(p=>p.id!==b.dataset.delete);save();refresh();toast('Product deleted')}})}function openEditor(){ $('#productEditor').classList.add('open') }function closeEditor(){$('#productEditor').classList.remove('open')}$('#addProductBtn').onclick=()=>{ $('#productForm').reset();$('#productId').value='';$('#editorTitle').textContent='Add product';$('#pSizes').value='S,M,L,XL';$('#pColors').value='#d8cbb7,#34342f';openEditor()};function editProduct(id){const p=products.find(x=>x.id===id);if(!p)return;$('#productId').value=p.id;$('#pName').value=p.name;$('#pCategory').value=p.category;$('#pPrice').value=p.price;$('#pImage').value=p.image;$('#pDescription').value=p.description||'';$('#pSizes').value=(p.sizes||[]).join(',');$('#pColors').value=(p.colors||[]).join(',');$('#pTag').value=p.tag||'';$('#editorTitle').textContent='Edit product';openEditor()}$('#closeEditor').onclick=closeEditor;$('#cancelEditor').onclick=closeEditor;$('#productForm').onsubmit=e=>{e.preventDefault();const id=$('#productId').value||'p'+Date.now();const p={id,name:$('#pName').value.trim(),category:$('#pCategory').value,price:Number($('#pPrice').value),image:$('#pImage').value.trim(),description:$('#pDescription').value.trim(),sizes:$('#pSizes').value.split(',').map(x=>x.trim()).filter(Boolean),colors:$('#pColors').value.split(',').map(x=>x.trim()).filter(Boolean),tag:$('#pTag').value.trim()};const i=products.findIndex(x=>x.id===id);if(i>=0)products[i]=p;else products.unshift(p);save();refresh();closeEditor();toast('Product saved')};$('#clearOrders').onclick=()=>{if(confirm('Clear all demo orders on this device?')){orders=[];save();refresh()}};$('#settingsForm').onsubmit=e=>{e.preventDefault();localStorage.setItem('or_brand',$('#brandName').value);localStorage.setItem('or_whatsapp',$('#whatsapp').value.replace(/\D/g,''));localStorage.setItem('or_currency',$('#currency').value);localStorage.setItem('or_mobile',$('#mobile').value.trim());localStorage.setItem('or_facebook',$('#facebook').value.trim());localStorage.setItem('or_tiktok',$('#tiktok').value.trim());toast('Settings saved')};$('#brandName').value=localStorage.getItem('or_brand')||'OUTFIT RELOAD';$('#whatsapp').value=localStorage.getItem('or_whatsapp')||'8801404609228';$('#mobile').value=localStorage.getItem('or_mobile')||'01404609228';$('#facebook').value=localStorage.getItem('or_facebook')||'https://www.facebook.com/mehedi.hasan.santo.0615';$('#tiktok').value=localStorage.getItem('or_tiktok')||'@mehedihasan0615';
