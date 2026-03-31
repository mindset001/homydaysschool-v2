/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  commonPasswordsImport,
  specialCharRegexImport,
} from "../../utils/regex";
import { Warning } from "../../assets/images";
import HidePasswordSVG from "../../components/svg/HidePasswordSVG";
import ShowPasswordSVG from "../../components/svg/ShowPasswordSVG";
import { useGuardianSignIn } from "../../services/api/auth";
import { saveTokens, setRole, setuser } from "../../utils/authTokens";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import LoginNavigator from "../../components/LoginNavigator";

const StaffLogin: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  // Toggle visibility
  const [toggleVisibility, setToggleVisibility] = useState<boolean>(false);
  const navigate = useNavigate();
  interface formInterface {
    studentId: string;
    password: string;
  }
  const [formData, setFormData] = useState<formInterface>({
    studentId: "",
    password: "",
  });

  //////////////////////////////
  // VALIDATION
  ////////////////////////////////////
  const specialCharRegex = specialCharRegexImport;
  const commonPasswords = commonPasswordsImport;

  ///////////////////////
  // STUDENT ID ERROR AND VALIDATION
  ///////////////////////
  const [studentIdErrorMessage, setStudentIdErrorMessage] = useState<string>("");
  const [toggleStudentIdError, setToggleStudentIdError] = useState<boolean>(false);

  const handleStudentId = (e: { target: { value: string } }): void => {
    const val = e.target.value.trim();
    const isEmpty = !val;
    const isShort = val.length < 4;
    if (isEmpty || isShort) {
      setToggleStudentIdError(true);
      setStudentIdErrorMessage(isEmpty ? "This field is required" : "Enter a valid Student ID");
    } else {
      setToggleStudentIdError(false);
      setStudentIdErrorMessage("");
    }
    setFormData({ ...formData, studentId: e.target.value });
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
    const isNotSpecialChar = !specialCharRegex.test(e.target.value);
    const isEmpty = e.target.value.trim() == "" || !e.target.value;
    const isSpaced = e.target.value.split(" ").length >= 2;
    const isShort = e.target.value.length <= 7;
    const isCommon = commonPasswords.includes(e.target.value.toLowerCase());
    const hasNotCapitalLetter = !/[A-Z]/.test(e.target.value);
    const hasNotSmallLetter = !/[a-z]/.test(e.target.value);
    const hasNotNumber = !/[0-9]/.test(e.target.value);

    isEmpty ||
    isSpaced ||
    isShort ||
    isCommon ||
    hasNotCapitalLetter ||
    hasNotSmallLetter ||
    hasNotNumber ||
    isNotSpecialChar
      ? (setTogglePasswordError(true),
        setPasswordErrorMessage(
          isSpaced
            ? "Password can't contain spaces"
            : isEmpty
            ? "This field is required"
            : isShort
            ? "Password is too short"
            : isCommon
            ? "Password is too common. Please change it"
            : hasNotCapitalLetter
            ? "Provide atleast one uppercase letter"
            : hasNotSmallLetter
            ? "Provide atleast one lowercase letter"
            : hasNotNumber
            ? "Password requires atleast one digit"
            : isNotSpecialChar
            ? "Atleast one special character is required"
            : ""
        ))
      : (setTogglePasswordError(false), setPasswordErrorMessage(""));

    setFormData({ ...formData, password: e.target.value });
    // console.log(formData);
  };

  const { mutate } = useGuardianSignIn();
  ////////////////////////////////////////////////////////////////////
  // HANDLE SIGN IN
  ////////////////////////////////////////////////////////////////////
  const handleSignIn = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const isValid =
      !toggleStudentIdError &&
      !togglePasswordError &&
      formData.studentId &&
      formData.password;

    if (!isValid) {
      !formData.studentId &&
        (setStudentIdErrorMessage("This field is required"),
        setToggleStudentIdError(true));
      !formData.password &&
        (setPasswordErrorMessage("This field is required"),
        setTogglePasswordError(true));
      return;
    }
    ////////////////////////////////////////////////
    setLoading(true);
    const userDetails = {
      studentId: formData.studentId.trim().toUpperCase(),
      password: formData.password,
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
        console.log("Guardian Data", userdata);
      },
      onError: (error: any) => {
        setLoading(false);
        const msg: string = error?.response?.data?.message ?? "";
        if (msg === "Invalid credentials" || msg.toLowerCase().includes("invalid")) {
          setTogglePasswordError(true);
          setPasswordErrorMessage("Incorrect Student ID or password");
          return;
        }
        if (msg === "Student account is deactivated") {
          toast.error("This student account has been deactivated. Please contact the school.");
          return;
        }
        toast.error("An error occurred. Check your internet connection and try again.");
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
        <label htmlFor="studentId" className="font-Lora text-[15px] font-medium">
          Student ID
        </label>
        <div className="relative w-full rounded-md mt-1 h-[41px]">
          <input
            type="text"
            placeholder="e.g. HMC0001"
            name="studentId"
            id="studentId"
            className={`w-full h-full border-2 border-solid rounded-[15px] py-[5px] pl-3 pr-[40px] outline-none font-Poppins text-[15px] uppercase
              ${
                toggleStudentIdError
                  ? " focus:border-[#FF2E2E] hover:border-[#FF2E2E] border-[#FF2E2E] focus:border-2"
                  : "focus:border-[#05878F] hover:border-[#05878F] border-[#05878F] focus:border-2"
              }`}
            autoComplete={"off"}
            value={formData.studentId}
            onChange={handleStudentId}
          />
          <span
            className={`h-[41px] absolute  right-[12px] cursor-pointer flex items-center top-0 bottom-0 ${
              toggleStudentIdError ? "visible" : "invisible"
            }`}
          >
            <img src={Warning} alt="warning" className="size-[15px]" />
          </span>
        </div>
        <div
          className={`text-[#FF2E2E] text-sm min-h-[20px] my-auto font-semibold font-Lora ${
            toggleStudentIdError ? "visible" : "invisible"
          }`}
        >
          {studentIdErrorMessage}
        </div>
      </div>
      <div className="flex flex-col mb-[5px]">
        <label htmlFor="password" className="font-Lora text-[15px] font-medium">
          Student's Password
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
          <Link to={"/forgot-password/guardian"} className="text-[#05878F]">
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
          formData.studentId &&
          !toggleStudentIdError &&
          !togglePasswordError
            ? loading
              ? "bg-[#05878F]/50 cursor-not-allowed px-[64px]"
              : "bg-[#05878F] cursor-pointer px-[94px]"
            : "bg-[#05878F]/50 cursor-not-allowed px-[94px]"
        }`}
        // onClick={handleLogin}
        disabled={
          formData.password &&
          formData.studentId &&
          !toggleStudentIdError &&
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
