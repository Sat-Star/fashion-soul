import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
  return (
    <Card className="w-full max-w-sm mx-auto bg-cream-50 border-2 border-cream-200 hover:border-brown-800 transition-all duration-300">
      <div onClick={() => handleGetProductDetails(product?._id)} className="cursor-pointer">
        <div className="relative">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg border-b-2 border-cream-200"
          />
          {product?.totalStock === 0 ? (
            <Badge className="absolute top-2 left-2 bg-brown-800 hover:bg-brown-900 text-cream-100">
              Out Of Stock
            </Badge>
          ) : product?.totalStock < 10 ? (
            <Badge className="absolute top-2 left-2 bg-brown-600 hover:bg-brown-700 text-cream-100">
              {`Only ${product?.totalStock} left`}
            </Badge>
          ) : product?.salePrice > 0 ? (
            <Badge className="absolute top-2 left-2 bg-gold-500 hover:bg-gold-600 text-brown-900">
              Limited Edition
            </Badge>
          ) : null}
        </div>
        <CardContent className="p-4">
          <h2 className="text-xl font-serif font-bold mb-2 text-brown-900">
            {product?.title}
          </h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-brown-600">
              {categoryOptionsMap[product?.category]}
            </span>
            <span className="text-sm text-brown-600">
              {brandOptionsMap[product?.brand]}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${product?.salePrice > 0 ? "line-through text-brown-400" : ""
                } text-lg font-semibold text-brown-600`}
            >
              ₹{product?.price?.toLocaleString('en-IN')}
            </span>
            {product?.salePrice > 0 && (
              <span className="text-lg font-bold text-brown-900">
                ₹{product?.salePrice?.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </CardContent>
      </div>
      <CardFooter className="pb-4 px-4">
        {product?.totalStock === 0 ? (
          <Button
            className="w-full bg-brown-200 text-brown-600 hover:bg-brown-200 cursor-not-allowed"
            disabled
          >
            Currently Unavailable
          </Button>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAddtoCart(product?._id);
              }}
              className="w-full bg-brown-800 hover:bg-brown-900 text-cream-100 h-11"
            >
              Add to Cart
            </Button>
            <Button
              onClick={() => handleGetProductDetails(product?._id)}
              variant="outline"
              className="w-full border-brown-800 text-brown-800 hover:bg-brown-50 h-11"
            >
              Quick View
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
