import React, { useState } from "react";
// import { Paper, TriangleFadeVector } from "../assets/images";
// import AdminSVG from "../components/svg/AdminSVG";
// import StaffSVG from "../components/svg/StaffSVG";
// import GuardianSVG from "../components/svg/GuardianSVG";
import { NavLink } from "react-router-dom";

import {
  consecutiveDotsRegexImport,
  emailRegexImport,
  invalidEmailCharRegexImport,
} from "../../utils/regex";
import { Paper, TriangleFadeVector, Warning } from "../../assets/images";
import AdminSVG from "../../components/svg/AdminSVG";
import StaffSVG from "../../components/svg/StaffSVG";
import GuardianSVG from "../../components/svg/GuardianSVG";

// import LoginNavigator from "../../components/LoginNavigator";

const ForgotPassword: React.FC = () => {
  //   const [loading, setLoading] = useState<boolean>(false);

  interface formInterface {
    emailAddress: string;
  }
  const [formData, setFormData] = useState<formInterface>({
    emailAddress: "",
  });

  // const navigate = useNavigate();
  // const location = useLocation();

  // useEffect(() => {
  //   const path = location.pathname;
  //   if (path === 'forgot-password') {
  //     navigate('forgot-password/admin', { replace: true });
  //   }
  // }, [location, navigate]);
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

  ////////////////////////////////////////////////////////////////////
  // HANDLE SIGN IN
  ////////////////////////////////////////////////////////////////////
  const handleSignIn = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const isValid =
      // !toggleUsernameError &&
      // !toggleFullnameError &&
      !toggleEmailError &&
      // formData.username &&
      // formData.fullname &&
      formData.emailAddress;

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
      //   !formData.password &&
      //     (setPasswordErrorMessage("This field is required"),
      //     setTogglePasswordError(true));
      return;
    }

    // .finally(() => dispatch(isLoading(false)));
  };

  return (
    <div className=" flex flex-col justify-center items-center bg-white md:bg-transparent min-h-screen">
      {/* lg:min-h-[65vh] xl:min-h-[70vh] 2xl:min-h-[75vh] */}
      <div className="min-h-[70vh] md:min-h-max  min-w-full md:min-w-[67%] lg:min-w-[57%] 2xl:min-w-[43.055%] flex flex-col justify-center items-center my-[30px] md:my-0">
        <div className="mx-auto size-[60px] bg-white shadow-[0px_8px_26px_0px_#046A7E2B] md:size-[68px] lg:size-[75px] 2xl:size-[82px] md:bg-[#ECFEFF] rounded-full flex justify-center items-center mb-[75px] lg:mb-[50px]">
          <img
            src={Paper}
            alt="logo"
            className="w-[21.7px] h-[26.14px] md:w-[27px] md:h-[36px] 2xl:w-[38.49px] 2xl:h-[46.35px]"
          />
        </div>
        {/* md:min-h-[calc(70vh-68px)] lg:min-h-[calc(65vh-75px)] xl:min-h-[calc(70vh-75px)] 2xl:min-h-[calc(75vh-82px)] */}
        <div className="flex flex-col justify-start min-h-[calc(70vh-60px)] md:min-h-max  w-full rounded-[20px] bg-white relative md:py-[26px] xl:py-[32px] 2xl:py-[40px]">
          <div className="absolute -z-[0] top-[20px] bottom-[20px] left-[20px] md:min-w-[235px] lg:max-w-[354px] hidden md:block">
            <img
              src={TriangleFadeVector}
              alt="TriangleFadeVector"
              className="object-cover object-left size-[100%]"
            />
          </div>
          <div className=" w-full flex flex-col justify-start md:justify-between items-center z-10">
            <div className="">
              <h2 className="text-center text-[28px] font-Lora xl:text-[30px] font-bold leading-[35.84px] mb-[10px]">
              Forgot Password
              </h2>
              <p className="hidden md:block text-[13px] font-Poppins md:text-[16px] leading-[19.5px] font-[400px] text-center mx-[20px]">
              Select an option below to reset your password
              </p>
            </div>
            <div className="md:flex-grow flex flex-row justify-around md:justify-evenly 2xl:justify-around text-[15px] font-Poppins leading-[18px] w-full mt-[20px] md:mt-[20px] md:mb-0 px-[30px] sm:px-[50px] md:px-[80px] xl:px-[100px] 2xl:px-[130px]">
              <NavLink
                to={"/forgot-password/admin"}
                className={({ isActive }) => (isActive ? "loginActiveNav" : "")}
              >
                <div className="text-center m-auto mb-[5px]">Admin</div>
                <div className="svg-size m-auto size-[50px] bg-white shadow-[0px_8px_26px_0px_#046A7E2B] rounded-[20px] flex flex-col justify-center items-center">
                  <div className="object-center object-cover max-w-[20px] h-[20px]">
                    <AdminSVG />
                  </div>
                </div>
              </NavLink>
              <NavLink
                to={"/forgot-password/staff"}
                className={({ isActive }) => (isActive ? "loginActiveNav" : "")}
              >
                <div className="text-center m-auto mb-[5px]">Staff</div>
                <div className="svg-size m-auto size-[50px] bg-white shadow-[0px_8px_26px_0px_#046A7E2B] rounded-[20px] flex flex-col justify-center items-center">
                  <div className="object-center object-cover max-w-[20px] h-[20px]">
                    <StaffSVG />
                  </div>
                </div>
              </NavLink>
              <NavLink
                to={"/forgot-password/guardian"}
                className={({ isActive }) => (isActive ? "loginActiveNav" : "")}
              >
                <div className="text-center m-auto mb-[5px]">Guardian</div>
                <div className="svg-size-guardian m-auto size-[50px] bg-white shadow-[0px_8px_26px_0px_#046A7E2B] rounded-[20px] flex flex-col justify-center items-center">
                  <div className="object-center object-cover max-w-[30px] h-[20px]">
                    <GuardianSVG />
                  </div>
                </div>
              </NavLink>
            </div>
          </div>
          <form
            onSubmit={handleSignIn}
            className="mt-[50px] lg:mt-[40px] 2xl:mt-[50px] w-auto mx-[30px] md:mx-[80px] z-10 flex flex-col justify-center"
          >
            <div>
              <div className="flex flex-col mb-[5px]">
                <label
                  htmlFor="email"
                  className="font-Lora text-[15px] font-medium"
                >
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
                    className={`h-[41px] absolute  right-[12px] cursor-text flex items-center top-0 bottom-0 ${
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
              <div className="text-center text-[#C4C4C4] font-Lora text-sm font-medium">
                We will send you a one-time password to your email address to
                reset your password
              </div>
            </div>

            <button
              className={`font-Lora text-white self-center border-2 border-[rgba(5,135,143,0.01)] border-solid rounded-[25px] inline-block text-xl font-bold lg:font-semibold py-[12px] md:px-[94px] w-full sm:max-w-[284px] text-center mt-[54px] lg:mt-[40px] 2xl:mt-[50px] md:mx-auto md:mb-[2px] ${
                formData.emailAddress && !toggleEmailError
                  ? "bg-[#05878F] cursor-pointer"
                  : "bg-[#05878F]/50 cursor-not-allowed"
              }`}
              // onClick={handleLogin}
              disabled={
                formData.emailAddress && !toggleEmailError ? false : true
              }
            >
              Get OTP
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
//   loginNavLink
//     ? "bg-[#05878F] cursor-pointer"
//     : "bg-[#05878F]/50 cursor-not-allowed"
