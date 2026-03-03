/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  consecutiveDotsRegexImport,
  emailRegexImport,
  invalidEmailCharRegexImport,
} from "../../utils/regex";
import { Warning } from "../../assets/images";
import HidePasswordSVG from "../../components/svg/HidePasswordSVG";
import ShowPasswordSVG from "../../components/svg/ShowPasswordSVG";
import { useSignIn } from "../../services/api/auth";
import { getRole, saveTokens, setRole, setuser } from "../../utils/authTokens";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import LoginNavigator from "../../components/LoginNavigator";

const StaffLogin: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  // Toggle visibility
  const [toggleVisibility, setToggleVisibility] = useState<boolean>(false);
  const navigate = useNavigate();
  interface formInterface {
    emailAddress: string;
    password: string;
  }
  const [formData, setFormData] = useState<formInterface>({
    emailAddress: "",
    password: "",
  });

  //////////////////////////////
  // VALIDATION REGEX
  ////////////////////////////////////
  //   const codeInjectionRegex = codeInjectionRegexImport;
  //   const sqlInjectionRegex = sqlInjectionRegexImport;
  // const invalidFullnameCharRegex = invalidFullnameCharRegexImport;
  const emailRegex = emailRegexImport;
  const invalidEmailCharRegex = invalidEmailCharRegexImport;
  const consecutiveDotsRegex = consecutiveDotsRegexImport;

  ///////////////////////
  // EMAIL ERROR AND VALIDATION
  ///////////////////////
  const [emailErrorMessage, setEmailErrorMessage] = useState<string>("");
  const [toggleEmailError, setToggleEmailError] = useState<boolean>(false);

  const handleEmail = (e: {
    target: {
      value: string;
    };
  }): void => {
    const isInvalid = !emailRegex.test(e.target.value);
    const isEmpty = e.target.value.trim() == "" || !e.target.value;
    const isShort = e.target.value.length <= 1;
    const hasSpecialChars = invalidEmailCharRegex.test(e.target.value);
    const hasConsecutiveDots = consecutiveDotsRegex.test(e.target.value);

    isInvalid || isEmpty || isShort || hasSpecialChars || hasConsecutiveDots
      ? (setToggleEmailError(true),
        setEmailErrorMessage(
          isInvalid
            ? "Enter valid email address"
            : isEmpty
            ? "This field is required"
            : isShort
            ? "Email address is too short"
            : hasSpecialChars
            ? "Email address contains invalid chars"
            : hasConsecutiveDots
            ? "Consecutive dots are not allowed"
            : ""
        ))
      : (setToggleEmailError(false), setEmailErrorMessage(""));

    setFormData({
      ...formData,
      emailAddress: e.target.value,
    });
    // console.log(formData);
  };
  ////////////////////////////////////
  // PASSWORD ERROR AND VALIDATION
  ////////////////////////////////////
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string>("");
  const [togglePasswordError, setTogglePasswordError] =
    useState<boolean>(false);

  const handlePassword = (e: {
    target: {
      value: string;
    };
  }): void => {
    const isEmpty = e.target.value.trim() == "" || !e.target.value;
    const isShort = e.target.value.length < 8;

    isEmpty || isShort
      ? (setTogglePasswordError(true),
        setPasswordErrorMessage(
          isEmpty
            ? "This field is required"
            : isShort
            ? "Password must be at least 8 characters"
            : ""
        ))
      : (setTogglePasswordError(false), setPasswordErrorMessage(""));

    setFormData({ ...formData, password: e.target.value });
    // console.log(formData);
  };

  const role = getRole();
  const { mutate } = useSignIn();
  ////////////////////////////////////////////////////////////////////
  // HANDLE SIGN IN
  ////////////////////////////////////////////////////////////////////
  const handleSignIn = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const isValid =
      // !toggleUsernameError &&
      // !toggleFullnameError &&
      !toggleEmailError &&
      !togglePasswordError &&
      // formData.username &&
      // formData.fullname &&
      formData.emailAddress &&
      formData.password;

    if (!isValid) {
      // Show appropriate error messages if fields are invalid
      // !formData.username &&
      //   (setUsernameErrorMessage("This field is required"),
      //   setToggleUsernameError(true));
      // !formData.fullname &&
      //   (setFullnameErrorMessage("This field is required"),
      //   setToggleFullnameError(true));
      !formData.emailAddress &&
        (setEmailErrorMessage("This field is required"),
        setToggleEmailError(true));
      !formData.password &&
        (setPasswordErrorMessage("This field is required"),
        setTogglePasswordError(true));
      return;
    }
    ////////////////////////////////////////////////
    setLoading(true);
    const userDetails = {
      email: formData.emailAddress,
      password: formData.password,
      role: role as string,
    };
    mutate(userDetails, {
      onSuccess: (response: { data: any }) => {
        const userdata = response.data;
        if (userdata) {
          saveTokens(userdata.accessToken, userdata.refreshToken);
          setRole(userdata.user.role);
          setuser(userdata.user);
          navigate("/dashboard"); // Navigate after successful login
        }
        setLoading(false);
      },
      onError: (error: any) => {
        console.error("Login failed:", error);
        if (error && !(error as any).response) {
          toast.error(
            "An error occured. Check your internet connection and/or login credentials"
          );
        }
        setLoading(false);

        // Still working on it
        if (error && (error as any).response) {
          if (error.response) {
            switch (error.response.data.message) {
              case "Invalid email or password":
                toast.error("An error occured. Invalid email or password");
                break;
              case "You don't have permission to access this page":
                toast.error("An error occured. Incorrect role details entered");
                break;
              case "net::ERR_PROXY_CONNECTION_FAILED":
                console.error("Check your internet connection");
                break;
              case "net::ERR_TIMED_OUT":
                console.error("Timeout error");
                break;
              default:
            }
          } else {
            console.error("Error occurred: ", error.message);
            toast.error(
              "An error occured. Check your internet connection and/or login credentials"
            );
          }
          // console.error("Error occurredDDDD: ", error.message);
          // toast.error(
          //   "An error occured. Check your internet connection and/or login credentials"
          // );
        } 
        else {
          console.error("An unknown error occurred");
          toast.error(
            "An error occured. Check your internet connection and/or login credentials"
          );
        }
        // Ends here
      },
    });

    ////////////////////////////////////////////////
    // .finally(() => dispatch(isLoading(false)));
  };

  const navRole = useLocation()
    .pathname.split("/")
    .map((decodeURI) => decodeURIComponent(decodeURI))
    .find((pathname) => ["admin", "staff", "guardian"].includes(pathname));

  useEffect(() => {
    navRole && setRole(navRole);
    console.log(navRole);
  }, [navRole]);
  return (
    <form
      onSubmit={handleSignIn}
      className="mt-[50px] md:mt-[10px] w-auto mx-[30px] md:mx-[80px] z-10 flex flex-col justify-center"
    >
      <div className="flex flex-col mb-[5px]">
        <label htmlFor="email" className="font-Lora text-[15px] font-medium">
          Email address
        </label>
        <div className="relative w-full rounded-md mt-1 h-[41px]">
          <input
            type="email"
            placeholder="Enter email address"
            name="email"
            id="email"
            className={`w-full h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px]
              ${
                toggleEmailError
                  ? " focus:border-[#FF2E2E] hover:border-[#FF2E2E] border-[#FF2E2E] focus:border-2"
                  : "focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
              }`}
            autoComplete={"on"}
            value={formData.emailAddress}
            onChange={handleEmail}
          />
          <span
            className={`h-[41px] absolute  right-[12px] cursor-pointer flex items-center top-0 bottom-0 ${
              toggleEmailError ? "visible" : "invisible"
            }`}
          >
            <img src={Warning} alt="warning" className="size-[15px]" />
          </span>
        </div>
        <div
          className={`text-[#FF2E2E] text-sm min-h-[20px] my-auto font-semibold font-Lora ${
            toggleEmailError ? "visible" : "invisible"
          }`}
        >
          {emailErrorMessage}
        </div>
      </div>
      <div className="flex flex-col mb-[5px]">
        <label htmlFor="password" className="font-Lora text-[15px] font-medium">
          Password
        </label>

        <div className="relative w-full rounded-md mt-1 h-[41px]">
          <input
            type={toggleVisibility ? "text" : "password"}
            placeholder="Enter password"
            name="password"
            id="password"
            className={`w-full h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px]
              ${
                togglePasswordError
                  ? " focus:border-[#FF2E2E] hover:border-[#FF2E2E] border-[#FF2E2E] focus:border-2"
                  : "focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
              }`}
            autoComplete={"on"}
            value={formData.password}
            onChange={handlePassword}
          />
          <span
            onClick={() => setToggleVisibility((toggle) => !toggle)}
            className={`h-[41px] absolute   right-[12px] cursor-pointer flex items-center top-0 bottom-0 ${
              formData.password ? "" : "passwordToggleFade"
            }`}
          >
            <>{toggleVisibility ? <HidePasswordSVG /> : <ShowPasswordSVG />}</>
          </span>
        </div>
        <div
          className={`text-[#FF2E2E] text-sm min-h-[20px] my-auto font-semibold font-Lora ${
            togglePasswordError ? "visible" : "invisible"
          }`}
        >
          {passwordErrorMessage}
        </div>

        <div className="flex flex-row justify-between mt-1 font-Poppins text-[13px] sm:text-sm md:text-base">
          <div className="flex flex-row items-center">
            <input
              type="checkbox"
              name="remember"
              id="remember"
              className={`custom-checkbox mr-[10px] size-5`}
            />
            <label htmlFor="remember" className="my-auto">
              Remember me
            </label>
          </div>
          <Link to={"/forgot-password/staff"} className="text-[#05878F]">
            Forgot password?
          </Link>
        </div>
      </div>
      {/* <button
        type="submit"
        className={`font-Lora bg-[#05878F]/50 border-2 border-[rgba(5,135,143,0.01)] border-solid rounded-[25px] text-xl font-bold lg:font-semibold py-[12px] px-[94px] w-full text-nowrap text-white mt-3 md:mt-4`}
        disabled={loading}
      >
        loading
            ? "bg-[rgba(92,70,255,0.5)] hover:bg-[rgba(92,70,255,0.5)] border-[rgba(92,70,255,0.5)] cursor-not-allowed"
            : "bg-[rgb(92,70,255)] hover:bg-[#05878F] border-[rgb(92,70,255)] cursor-pointer"
        {loading ? "Logging In ..." : "Login"}
      </button>
       */}
      <button
        className={`font-Lora text-white self-center border-2 border-[rgba(5,135,143,0.01)] border-solid rounded-[25px] inline-block text-xl font-bold lg:font-semibold py-[12px] w-full sm:w-auto text-center mt-[54px] md:mt-[23px]  md:mb-[2px] ${
          formData.password &&
          formData.emailAddress &&
          !toggleEmailError &&
          !togglePasswordError
            ? loading
              ? "bg-[#05878F]/50 cursor-not-allowed px-[64px]"
              : "bg-[#05878F] cursor-pointer px-[94px]"
            : "bg-[#05878F]/50 cursor-not-allowed px-[94px]"
        }`}
        // onClick={handleLogin}
        disabled={
          formData.password &&
          formData.emailAddress &&
          !toggleEmailError &&
          !togglePasswordError
            ? loading
              ? true
              : false
            : true
        }
      >
        {loading ? "Logging In ..." : "Login"}
      </button>
    </form>
  );
};

export default StaffLogin;
//   loginNavLink
//     ? "bg-[#05878F] cursor-pointer"
//     : "bg-[#05878F]/50 cursor-not-allowed"
