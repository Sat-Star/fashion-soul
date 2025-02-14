import { useEffect, useState } from "react";
import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { 
  addFeatureImage, 
  getFeatureImages, 
  removeFeatureImage 
} from "@/store/common-slice";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { featureImageList, loading } = useSelector((state) => state.commonFeature);

  const handleUploadFeatureImage = async () => {
    try {
      if (!uploadedImageUrl) {
        toast({
          title: "No image selected",
          variant: "destructive"
        });
        return;
      }

      const result = await dispatch(addFeatureImage(uploadedImageUrl)).unwrap();
      
      if (result.success) {
        toast({ title: "Image uploaded successfully" });
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      const result = await dispatch(removeFeatureImage(imageId)).unwrap();
      if (result.success) {
        toast({ title: "Image removed successfully" });
        dispatch(getFeatureImages());
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Feature Images Management</h2>
        
        <div className="mb-8">
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isCustomStyling={true}
          />
          
          <Button 
            onClick={handleUploadFeatureImage}
            className="mt-4 w-full"
            disabled={imageLoadingState || !uploadedImageUrl}
          >
            {imageLoadingState ? "Uploading..." : "Upload Image"}
          </Button>
        </div>

        <section>
          <h3 className="text-xl font-semibold mb-4">Current Feature Images</h3>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          ) : featureImageList?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {featureImageList.map((featureImgItem) => (
                <div 
                  key={featureImgItem._id}
                  className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={featureImgItem.image}
                    className="w-full h-48 object-cover"
                    alt="Feature"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteImage(featureImgItem._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No feature images uploaded yet
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;