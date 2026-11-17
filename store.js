const translations={en:{announce:'OUTFIT RELOAD — MEN’S STYLE, RELOADED',new:'NEW IN',shop:'SHOP',story:'OUR STORY',heroEyebrow:'THE NEW SEASON EDIT',heroTitle:'Less, but<br>better.',heroText:'Considered pieces. Effortless everyday style.',discover:'DISCOVER THE COLLECTION ↗',introEyebrow:'A STUDY IN SIMPLICITY',introTitle:'Everyday pieces,<br><i>beautifully considered.</i>',introText:'A modern wardrobe built around thoughtful design, quiet confidence and pieces you will reach for again and again.',curated:'CURATED FOR YOU',featured:'Featured pieces',all:'ALL',men:'SHIRTS',women:'PANTS',accessories:'SHOES',campaignEyebrow:'MADE TO MOVE WITH YOU',campaignTitle:'Find your<br>everyday uniform.',shopCollection:'SHOP THE COLLECTION ↗',newsletterEyebrow:'A NOTE FROM US',newsletterTitle:'Good things, occasionally.',newsletterText:'New arrivals, thoughtful edits and little updates. No noise.',subscribe:'SUBSCRIBE ↗',rights:'ALL RIGHTS RESERVED.',yourBag:'Your bag',subtotal:'Subtotal',codNote:'Cash on delivery. Delivery fee confirmed on WhatsApp.',checkout:'ORDER VIA WHATSAPP ↗',chooseSize:'SELECT SIZE',chooseColor:'SELECT COLOUR',addBag:'ADD TO BAG'},bn:{announce:'OUTFIT RELOAD — পুরুষদের নতুন স্টাইল',new:'নতুন',shop:'শপ',story:'আমাদের গল্প',heroEyebrow:'নতুন সিজনের কালেকশন',heroTitle:'কম, কিন্তু<br>আরও সুন্দর।',heroText:'প্রতিদিনের জন্য বাছাই করা পোশাক।',discover:'কালেকশন দেখুন ↗',introEyebrow:'সরলতার ছোঁয়া',introTitle:'প্রতিদিনের পোশাক,<br><i>যত্নে বাছাই করা।</i>',introText:'আধুনিক ডিজাইন, স্বাচ্ছন্দ্য আর আত্মবিশ্বাসের জন্য তৈরি পোশাক।',curated:'আপনার জন্য',featured:'নির্বাচিত পণ্য',all:'সব',men:'শার্ট',women:'প্যান্ট',accessories:'জুতা',campaignEyebrow:'আপনার চলার সঙ্গী',campaignTitle:'প্রতিদিনের<br>নিজস্ব স্টাইল।',shopCollection:'কালেকশন কিনুন ↗',newsletterEyebrow:'আমাদের কাছ থেকে',newsletterTitle:'মাঝেমধ্যে সুন্দর খবর।',newsletterText:'নতুন পণ্য ও বিশেষ আপডেট।',subscribe:'সাবস্ক্রাইব ↗',rights:'সর্বস্বত্ব সংরক্ষিত।',yourBag:'আপনার ব্যাগ',subtotal:'মোট',codNote:'ক্যাশ অন ডেলিভারি। ডেলিভারি চার্জ WhatsApp-এ নিশ্চিত হবে।',checkout:'WHATSAPP-এ অর্ডার ↗',chooseSize:'সাইজ বাছাই করুন',chooseColor:'রং বাছাই করুন',addBag:'ব্যাগে যোগ করুন'},ar:{announce:'OUTFIT RELOAD — أسلوب رجالي متجدد',new:'وصل حديثاً',shop:'تسوق',story:'قصتنا',heroEyebrow:'تشكيلة الموسم الجديد',heroTitle:'أقل، لكن<br>أفضل.',heroText:'قطع مختارة وأناقة يومية سهلة.',discover:'اكتشف التشكيلة ↗',introEyebrow:'بساطة مدروسة',introTitle:'قطع يومية،<br><i>بتفاصيل مدروسة.</i>',introText:'خزانة عصرية تجمع بين التصميم المدروس والثقة الهادئة والقطع التي ستعود إليها دائماً.',curated:'مختارة لك',featured:'قطع مميزة',all:'الكل',men:'قمصان',women:'بناطيل',accessories:'أحذية',campaignEyebrow:'مصممة لترافقك',campaignTitle:'أسلوبك<br>اليومي.',shopCollection:'تسوق التشكيلة ↗',newsletterEyebrow:'رسالة منا',newsletterTitle:'أخبار جميلة من حين لآخر.',newsletterText:'وصل حديثاً وتحديثات مختارة، بلا إزعاج.',subscribe:'اشترك ↗',rights:'جميع الحقوق محفوظة.',yourBag:'حقيبتك',subtotal:'المجموع',codNote:'الدفع عند الاستلام. يتم تأكيد رسوم التوصيل عبر واتساب.',checkout:'اطلب عبر واتساب ↗',chooseSize:'اختر المقاس',chooseColor:'اختر اللون',addBag:'أضف إلى الحقيبة'}};
let products=loadStoreProducts();let cart=JSON.parse(localStorage.getItem('mf_cart')||'[]');let activeProduct=null,chosenSize='',chosenColor='';const $=s=>document.querySelector(s);const money=n=>'AED '+Number(n).toFixed(0);function save(){localStorage.setItem('mf_cart',JSON.stringify(cart));localStorage.setItem('or_products',JSON.stringify(products));}function renderProducts(filter='All'){const lang=$('#language').value;$('#productGrid').innerHTML=products.filter(p=>filter==='All'||p.category===filter).map(p=>`<article class="product-card" data-id="${p.id}"><div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy">${p.tag?`<span class="product-tag">${p.tag}</span>`:''}<button class="quick-add" data-id="${p.id}">QUICK VIEW +</button></div><div class="product-meta"><div><div class="product-name">${p.name}</div><div class="product-category">${p.category}</div></div><span class="price">${money(p.price)}</span></div></article>`).join('');document.querySelectorAll('.product-card').forEach(el=>el.addEventListener('click',()=>openProduct(el.dataset.id)));}function openProduct(id){activeProduct=products.find(p=>p.id===id);if(!activeProduct)return;chosenSize='';chosenColor=activeProduct.colors[0];$('#modalImage').src=activeProduct.image;$('#modalImage').alt=activeProduct.name;$('#modalCategory').textContent=activeProduct.category;$('#modalName').textContent=activeProduct.name;$('#modalPrice').textContent=money(activeProduct.price);$('#modalDescription').textContent=activeProduct.description;$('#sizeOptions').innerHTML=activeProduct.sizes.map(s=>`<button data-size="${s}">${s}</button>`).join('');$('#colorOptions').innerHTML=activeProduct.colors.map(c=>`<button data-color="${c}" style="background:${c}" aria-label="Colour"></button>`).join('');$('#sizeOptions').querySelectorAll('button').forEach(b=>b.onclick=()=>{chosenSize=b.dataset.size;$('#sizeOptions').querySelectorAll('button').forEach(x=>x.classList.toggle('selected',x===b));});$('#colorOptions').querySelectorAll('button').forEach(b=>b.onclick=()=>{chosenColor=b.dataset.color;$('#colorOptions').querySelectorAll('button').forEach(x=>x.style.outline=x===b?'2px solid #222':'none');});$('#productModal').classList.add('open');}function renderCart(){const count=cart.reduce((a,b)=>a+b.qty,0);$('#cartCount').textContent=count;$('#subtotal').textContent=money(cart.reduce((a,b)=>a+b.price*b.qty,0));$('#cartItems').innerHTML=cart.length?cart.map((p,i)=>`<div class="cart-row"><img src="${p.image}" alt=""><div><h4>${p.name}</h4><p>Size: ${p.size} · Qty: ${p.qty}</p><b>${money(p.price*p.qty)}</b><p><button data-remove="${i}">REMOVE</button></p></div><span>${money(p.price)}</span></div>`).join(''):'<p class="muted" style="padding:25px 0">Your bag is currently empty.</p>';$('#cartItems').querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{cart.splice(+b.dataset.remove,1);save();renderCart();});}function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),2200)}function openCart(){renderCart();$('#cartDrawer').classList.add('open');$('#backdrop').classList.add('open')}function closeCart(){$('#cartDrawer').classList.remove('open');$('#backdrop').classList.remove('open')}document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));renderProducts(b.dataset.filter)});$('#language').onchange=e=>{const l=e.target.value,t=translations[l];document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';document.querySelectorAll('[data-i18n]').forEach(el=>{const v=t[el.dataset.i18n];if(v)el.innerHTML=v;});};$('#addToCart').onclick=()=>{if(!chosenSize){toast('Please select a size');return}cart.push({id:activeProduct.id,name:activeProduct.name,price:activeProduct.price,image:activeProduct.image,size:chosenSize,color:chosenColor,qty:1});save();renderCart();$('#productModal').classList.remove('open');toast('Added to your bag');};$('#cartBtn').onclick=openCart;$('#closeCart').onclick=closeCart;$('#backdrop').onclick=closeCart;$('#closeProduct').onclick=()=>$('#productModal').classList.remove('open');$('#checkoutBtn').onclick=()=>{if(!cart.length){toast('Your bag is empty');return}const customer=prompt('Your name for the order:');if(!customer)return;const phoneNumber=prompt('Your WhatsApp / mobile number:');if(!phoneNumber)return;const address=prompt('Delivery address / area:');if(!address)return;const lines=cart.map(p=>`${p.name} | Size ${p.size} | Qty ${p.qty} | ${money(p.price)}`).join('\n');const total=cart.reduce((a,b)=>a+b.price*b.qty,0);const order={id:'MF-'+Date.now().toString().slice(-7),customer,phone:phoneNumber,address,items:cart.map(p=>`${p.name} (${p.size}) ×${p.qty}`).join(', '),total,status:'Pending',date:new Date().toISOString()};const orders=JSON.parse(localStorage.getItem('mf_orders')||'[]');orders.push(order);localStorage.setItem('mf_orders',JSON.stringify(orders));const msg=`Hello! I would like to place a Cash on Delivery order:\nName: ${customer}\nPhone: ${phoneNumber}\nAddress: ${address}\n${lines}\nSubtotal: ${money(total)}\nPlease confirm my order and delivery fee.`;const wa=localStorage.getItem('or_whatsapp')||'8801404609228';window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`,'_blank');cart=[];save();renderCart();closeCart();toast('Order saved in this browser. Complete it in WhatsApp.');};$('#searchBtn').onclick=()=>{const q=prompt('Search products');if(q){const found=products.find(p=>p.name.toLowerCase().includes(q.toLowerCase()));if(found)openProduct(found.id);else toast('No matching product found')}};$('#newsletterForm').onsubmit=e=>{e.preventDefault();toast('Thank you for subscribing!');e.target.reset()};$('#menuBtn').onclick=()=>document.querySelector('#shop').scrollIntoView();renderProducts();renderCart();

async function loadProductsFromSupabase() {
  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select(`
        id,
        name,
        description,
        price,
        image_url,
        tag,
        active,
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
        sizes: [...new Set(
          variants.map(v => v.size).filter(Boolean)
        )],
        colors: [...new Set(
          variants.map(v => v.color).filter(Boolean)
        )]
      };
    });

    const activeFilter =
      document.querySelector(".filter.active")?.dataset.filter || "All";

    renderProducts(activeFilter);

  } catch (error) {
    console.error("Supabase product loading error:", error);
    toast("Products could not be loaded from database.");
  }
}

loadProductsFromSupabase();
