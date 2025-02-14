import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();

    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });

        const pendingTransaction = sessionStorage.getItem('pendingTransaction');
        if (pendingTransaction) {
          sessionStorage.removeItem('pendingTransaction');
          navigate(`/shop/phonepe-return?transactionId=${pendingTransaction}`);
        } else {
          navigate(user?.role === 'admin' ? '/admin/dashboard' : '/shop/home');
        }

      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  useEffect(() => {
    const pendingTransaction = sessionStorage.getItem('pendingTransaction');
    if (pendingTransaction) {
      toast({
        title: "Please login to complete your payment",
        variant: "default",
      });
    }
  }, []);

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-brown-800 font-serif">
          Welcome Back to Soulvard
        </h1>
        <p className="mt-2 text-brown-600">
          Don't have an account
          <Link
            className="font-medium ml-2 text-brown-800 hover:text-brown-900 underline"
            to="/auth/register"
          >
            Create Account
          </Link>
        </p>
      </div>
      <CommonForm
        // Add classNames prop if your CommonForm accepts it
        className="bg-cream-100 p-8 rounded-lg border border-cream-200"
        formControls={loginFormControls}
        buttonText={"Sign In"}
        buttonClassName="w-full bg-brown-800 hover:bg-brown-900 text-cream-100"
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AuthLogin;
