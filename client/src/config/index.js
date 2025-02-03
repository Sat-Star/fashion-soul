export const registerFormControls = [
  {
    name: "userName",
    label: "User Name",
    placeholder: "Enter your user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const addProductFormElements = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
  },
  {
    label: "Categories",
    name: "categories",
    componentType: "multiselect",
    options: [
      { id: "men", label: "Men" },
      { id: "unisex", label: "Unisex" },
      { id: "collaboration", label: "Collaboration" },
      { id: "couple-clothes", label: "Couple Clothes" },
      { id: "pair-love", label: "Pair With Love Ones" },
      { id: "limited-edition", label: "Limited Edition" },
      { id: "newest-arrived", label: "Newest Arrived" },
    ],
    placeholder: "Select categories...",
  },
  {
    label: "Brand",
    name: "brand",
    componentType: "select",
    options: [
      { id: "nike", label: "Nike" },
      { id: "adidas", label: "Adidas" },
      { id: "puma", label: "Puma" },
      { id: "levi", label: "Levi's" },
      { id: "zara", label: "Zara" },
      { id: "h&m", label: "H&M" },
    ],
  },
  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter product price",
  },
  {
    label: "Sale Price",
    name: "salePrice",
    componentType: "input",
    type: "number",
    placeholder: "Enter sale price (optional)",
  },
  {
    label: "Total Stock",
    name: "totalStock",
    componentType: "input",
    type: "number",
    placeholder: "Enter total stock",
  },
  {
    label: "Sizes",
    name: "sizes",
    componentType: "input",
    type: "text",
    placeholder: "Enter sizes (comma separated, e.g., S, M, L)",
  },
];

export const shoppingViewHeaderMenuItems = [
  { id: "home", label: "Home", path: "/shop/home" },
  { id: "products", label: "Products", path: "/shop/listing" },
  { id: "men", label: "Men", path: "/shop/listing?category=men" },
  { id: "unisex", label: "Unisex", path: "/shop/listing?category=unisex" },
  { id: "collaboration", label: "Collaboration", path: "/shop/listing?category=collaboration" },
  { id: "couple-clothes", label: "Couple", path: "/shop/listing?category=couple-clothes" },
  { id: "limited-edition", label: "Limited", path: "/shop/listing?category=limited-edition" },
  { id: "newest-arrived", label: "New", path: "/shop/listing?category=newest-arrived" },
  { id: "search", label: "Search", path: "/shop/search" },
];

export const categoryOptionsMap = {
  "men": "Men",
  "unisex": "Unisex",
  "collaboration": "Collaboration",
  "couple-clothes": "Couple Clothes",
  "pair-love": "Pair With Love Ones",
  "limited-edition": "Limited Edition",
  "newest-arrived": "Newest Arrived"
};

export const brandOptionsMap = {
  nike: "Nike",
  adidas: "Adidas",
  puma: "Puma",
  levi: "Levi",
  zara: "Zara",
  "h&m": "H&M",
};

export const filterOptions = {
  categories: [
    { id: "men", label: "Men" },
    { id: "unisex", label: "Unisex" },
    { id: "collaboration", label: "Collaboration" },
    { id: "couple-clothes", label: "Couple Clothes" },
    { id: "pair-love", label: "Pair With Love Ones" },
    { id: "limited-edition", label: "Limited Edition" },
    { id: "newest-arrived", label: "Newest Arrived" },
  ],
  brand: [
    { id: "nike", label: "Nike" },
    { id: "adidas", label: "Adidas" },
    { id: "puma", label: "Puma" },
    { id: "levi", label: "Levi's" },
    { id: "zara", label: "Zara" },
    { id: "h&m", label: "H&M" },
  ],
  colors: [
    { id: "white", label: "White" },
    { id: "black", label: "Black" },
    { id: "blue", label: "Blue" },
    { id: "red", label: "Red" },
  ],
};

export const colorOptionsMap = {
  white: "White",
  black: "Black",
  blue: "Blue",
  red: "Red",
};

export const colorConfig = {
  White: {
    hex: '#FFFFFF',
    uploadLabel: 'Upload White Variant'
  },
  Black: {
    hex: '#000000',
    uploadLabel: 'Upload Black Variant'
  },
  Blue: {
    hex: '#0000FF',
    uploadLabel: 'Upload Blue Variant'
  },
  Red: {
    hex: '#FF0000',
    uploadLabel: 'Upload Red Variant'
  }
};

export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

export const addressFormControls = [
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any additional notes",
  },
];