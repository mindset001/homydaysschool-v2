import { Vortex } from "react-loader-spinner";

const Loader = () => {
  return (
    <div className="m-auto w-fit z-10 flex flex-col my-[15%] md:my-[10%] lg:my-[15%] justify-center text-center">
      <div className="">
        <Vortex
          visible={true}
          height="80"
          width="80"
          ariaLabel="vortex-loading"
          wrapperStyle={{}}
          wrapperClass="vortex-wrapper"
          colors={[
            "#05878F",
            "#05878F",
            "#05878F",
            "#05878F",
            "#05878F",
            "#05878F",
          ]}
        />
      </div>
      <span>
        <em>Please wait...</em>
      </span>
    </div>
  );
};

export default Loader;
