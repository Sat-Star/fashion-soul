import { Button } from "@/components/ui/button";
import bannerOne from "../../assets/banner-1.webp";
import bannerTwo from "../../assets/banner-2.webp";
import bannerThree from "../../assets/banner-3.webp";
import {
  Airplay,
  BabyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  Heater,
  Images,
  Shirt,
  ShirtIcon,
  ShoppingBasket,
  UmbrellaIcon,
  WashingMachine,
  WatchIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { getFeatureImages } from "@/store/common-slice";

const categoriesWithIcon = [
  { id: "men", label: "Men", icon: ShirtIcon },
  { id: "unisex", label: "Unisex", icon: ShirtIcon },
  { id: "collaboration", label: "Collaboration", icon: CloudLightning },
  { id: "couple-clothes", label: "Couple Clothes", icon: BabyIcon },
  { id: "pair-love", label: "Pair With Love Ones", icon: WatchIcon },
  { id: "limited-edition", label: "Limited Edition", icon: UmbrellaIcon },
  { id: "newest-arrived", label: "Newest Arrived", icon: Airplay },
];

const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: Shirt },
  { id: "adidas", label: "Adidas", icon: WashingMachine },
  { id: "puma", label: "Puma", icon: ShoppingBasket },
  { id: "levi", label: "Levi's", icon: Airplay },
  { id: "zara", label: "Zara", icon: Images },
  { id: "h&m", label: "H&M", icon: Heater },
];
function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId) {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
    }, 15000);

    return () => clearInterval(timer);
  }, [featureImageList]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  console.log(productList, "productList");

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-cream-50">
      {/* Hero Carousel */}
      <div className="relative w-full h-[600px] overflow-hidden border-b-2 border-cream-200">
        {featureImageList?.map((slide, index) => (
          <img
            src={slide?.image}
            key={index}
            className={`${index === currentSlide ? "opacity-100" : "opacity-0"}
              absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000`}
          />
        ))}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {featureImageList?.map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-colors ${currentSlide === idx ? 'bg-brown-800' : 'bg-brown-300'}`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentSlide(prev => (prev - 1 + featureImageList.length) % featureImageList.length)}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-cream-100/80 border-brown-800 text-brown-800 hover:bg-brown-800 hover:text-cream-100"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentSlide(prev => (prev + 1) % featureImageList.length)}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-cream-100/80 border-brown-800 text-brown-800 hover:bg-brown-800 hover:text-cream-100"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </Button>
      </div>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-serif font-bold text-center mb-12 text-brown-900">
            Curated Collections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {productList?.map((productItem) => (
              <ShoppingProductTile
                key={productItem._id?.$oid || productItem._id}
                handleGetProductDetails={handleGetProductDetails}
                product={productItem}
                handleAddtoCart={handleAddtoCart}
                className="bg-cream-100 border-2 border-cream-200 hover:border-brown-800 transition-all"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-cream-100 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-brown-900 mb-4">
              Explore by Lifestyle
            </h2>
            <p className="text-brown-600 max-w-2xl mx-auto">
              Discover pieces that complement your unique style journey
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categoriesWithIcon.map((categoryItem) => (
              <Card
                key={categoryItem.id}
                onClick={() => handleNavigateToListingPage(categoryItem, "categories")}
                className="cursor-pointer bg-cream-50 hover:bg-brown-800 group transition-all border-2 border-cream-200 hover:border-brown-900"
              >
                <CardContent className="flex flex-col items-center p-4">
                  <categoryItem.icon className="w-8 h-8 mb-3 text-brown-800 group-hover:text-cream-100 transition-colors" />
                  <span className="font-semibold text-center text-brown-800 group-hover:text-cream-100 transition-colors">
                    {categoryItem.label}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-serif font-bold text-center mb-12 text-brown-900">
            Crafted with Excellence
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {brandsWithIcon.map((brandItem) => (
              <Card
                key={brandItem.id}
                onClick={() => handleNavigateToListingPage(brandItem, "brand")}
                className="cursor-pointer bg-cream-100 border-2 border-cream-200 hover:border-brown-800 transition-all hover:shadow-lg"
              >
                <CardContent className="flex flex-col items-center p-6">
                  <brandItem.icon className="w-12 h-12 mb-4 text-brown-800" />
                  <span className="font-bold text-brown-900">{brandItem.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingHome;
