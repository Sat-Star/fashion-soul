import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full bg-cream-50">
      <div className="hidden lg:flex items-center justify-center bg-cream-100 w-1/2 px-12 border-r-2 border-cream-200">
        <div className="max-w-md space-y-6 text-center text-brown-800">
          <h1 className="text-4xl font-extrabold tracking-tight font-serif">
            Welcome to Soulvard
          </h1>
          <p className="text-lg text-brown-600">
            Discover timeless elegance in every purchase
          </p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-cream-50 px-4 py-12 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
