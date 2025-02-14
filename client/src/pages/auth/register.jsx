import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();
    dispatch(registerUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
        navigate("/auth/login");
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  console.log(formData);

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-brown-800 font-serif">
          Join Soulvard
        </h1>
        <p className="mt-2 text-brown-600">
          Already have an account
          <Link
            className="font-medium ml-2 text-brown-800 hover:text-brown-900 underline"
            to="/auth/login"
          >
            Sign In
          </Link>
        </p>
      </div>
      <CommonForm
        className="bg-cream-100 p-8 rounded-lg border border-cream-200"
        formControls={registerFormControls}
        buttonText={"Create Account"}
        buttonClassName="w-full bg-brown-800 hover:bg-brown-900 text-cream-100"
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AuthRegister;
