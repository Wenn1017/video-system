import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { useContext } from "react";
import * as Yup from "yup";
import { MDBContainer, MDBCard, MDBInput, MDBBtn } from "mdb-react-ui-kit";
// import { AlertContext } from "../../context/AlertContext";
import "./LoginPage.css";
import { Link } from "react-router-dom";

const schema = Yup.object().shape({
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

function LoginPage() {
  const navigate = useNavigate();
  // const { setAlertVisibility, setAlertMessage, setType } = useContext(AlertContext);

  const loginUser = async (user) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const data = await response.json();
      const [type, text] = Object.entries(data)[0];
      // setAlertMessage(text);
      // setAlertVisibility(true);
      // setType(type);
      
      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/mainURL");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  return (
    <MDBContainer fluid className="login-container">
      <div className="left-login"></div>
      <div className="right-login">
        <MDBCard style={{ borderRadius: "15px", maxWidth: "500px", width: "100%" }}>
          <h6 className="login-title">WELCOME TO VIDEO ANALYSIS AND NOTE GENERATION SYSTEM</h6>
          <Formik
            validationSchema={schema}
            initialValues={{ email: "", password: "" }}
            onSubmit={(values) => loginUser(values)}
          >
            {({ values, errors, touched, handleChange, handleBlur }) => (
              <Form>
                <div className="input-login">
                  <span>Email Address</span>
                  <MDBInput
                    wrapperClass="input-field1"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@mail.com"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <p className="error">{errors.email && touched.email && errors.email}</p>
                </div>
                <div className="input-login">
                  <span>Password</span>
                  <MDBInput
                    wrapperClass="input-field1"
                    id="password"
                    name="password"
                    type="password"
                    placeholder="must have at least 6 characters"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <p className="error">{errors.password && touched.password && errors.password}</p>
                </div>
                <div className="button-login">
                  <MDBBtn className="login-button" color="dark" type="submit">
                    <span>LOG IN</span>
                  </MDBBtn>
                </div>
              </Form>
            )}
          </Formik>
          <div className="forgot-links">
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>
          <div className="new-account">
            Don't have an account?&nbsp;
            <Link to="/signup" className="register-link">Register here</Link>
          </div>
        </MDBCard>
      </div>
    </MDBContainer>
  );
}

export default LoginPage;