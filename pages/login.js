import { useState } from "react";
import Image from "next/image";
import { FaEyeSlash, FaAt, FaEye } from "react-icons/fa";

import { onLogin } from "../services/loginService";
import { toast } from "sonner";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [viewPassword, setViewPassword] = useState(false);
  const [unauthorisedUser, setUnauthorisedUser] = useState(false);

  // on submiting login credentials
  const onSubmit = () => {
    if (!credentials.username) {
      alert("Please Enter Username!");
    } else if (!credentials.password) {
      alert("Please Enter Password!");
    } else {
      onLogin(credentials, setUnauthorisedUser);
    }
  };

  const onChangeHandler = (e) => {
    setUnauthorisedUser(false);
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="container">
      <div className="box">
        <div className="mt-[-30px]">
          <Image src="/Ornate-Solar-Logo.png" width={200} height={50} alt="" />
        </div>
        <div className="content">Enter your login details</div>
        <form onSubmit={onSubmit} className="input_area">
          <div className="relative flex w-[80%]">
            <input
              className="login_fields mb-[10px]"
              type="text"
              value={credentials.username}
              name="username"
              placeholder="Phone Number"
              onChange={onChangeHandler}
            />
            <div className="login_icon">
              <FaAt size={13} />
            </div>
          </div>
          <div className="relative flex w-[80%]">
            <input
              className="login_fields"
              type={viewPassword ? "text" : "password"}
              value={credentials.password}
              placeholder="Password"
              name="password"
              onChange={onChangeHandler}
            />
            <div className="login_icon">
              {viewPassword ? (
                <FaEye
                  cursor="pointer"
                  size={13}
                  onClick={() => setViewPassword(false)}
                />
              ) : (
                <FaEyeSlash
                  cursor="pointer"
                  size={13}
                  onClick={() => setViewPassword(true)}
                />
              )}
            </div>
          </div>
        </form>
        <div className="footer">
          {/* <div><input type="checkbox"/>Remember me</div> */}
          <div style={{ position: "relative", right: "-80%" }}>
            {/* <Link to=''>Forgot Password?</Link> */}
          </div>
        </div>
        <div className="mt-[10px] flex w-full flex-col items-center justify-center gap-4">
          <button
            className="login_button common"
            style={{ margin: "0" }}
            onClick={() => {
              onSubmit();
            }}
            type="submit"
          >
            Login
          </button>
          {unauthorisedUser && (
            <p className="text-red-600">
              (Sorry! Please login with authorised credentials)
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
