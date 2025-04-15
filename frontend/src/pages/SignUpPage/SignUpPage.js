import React from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  MDBContainer,
  MDBCard,
  MDBInput,
  MDBBtn,
} from "mdb-react-ui-kit";
<<<<<<< HEAD
=======
// import { AlertContext } from "../../context/AlertContext";
>>>>>>> 2fb5340052fcd276b9598069452a61be6d86f7c1
import "./SignUpPage.css";

const schema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  repeat_password: Yup.string()
    .required("Repeat Password is required")
    .oneOf([Yup.ref("password"), null], "Passwords must match"),
});

function SignUpPage() {
  const navigate = useNavigate();
  // const { setAlertVisibility, setAlertMessage, setType } = useContext(AlertContext);

  const add_user = async (values) => {
    const { username, email, password } = values; // Exclude repeat_password before sending
    try {
      const response = await fetch("http://127.0.0.1:5000/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
      if (data.success) {
<<<<<<< HEAD
        navigate("/");
=======
        navigate("/main");
>>>>>>> 2fb5340052fcd276b9598069452a61be6d86f7c1
      } else {
        alert(data.error || "Something went wrong");
        navigate("/signup");
      }
    } else {
      alert("Server returned an error status");
    }
  } catch (error) {
    console.error("Fetch error:", error);
    alert("An unexpected error occurred");
  }
};

  return (
    <MDBContainer fluid className="signup-container">
      <div className="left-signup"></div>
      <div className="right-signup">
        <MDBCard style={{ borderRadius: "15px", maxWidth: "500px", width: "100%" }}>
          <h6 className="signup-title">SIGN UP</h6>
          <Formik
            validationSchema={schema}
            initialValues={{ username: "", email: "", password: "", repeat_password: "" }}
            onSubmit={add_user}
          >
            {({ values, errors, touched, handleChange, handleBlur }) => (
              <Form>
                <div className="input-signup">
                  <span>Username</span>
                  <MDBInput
                    wrapperClass="input-field2"
                    id="username"
                    name="username"
                    type="text"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.username}
                  />
                  <p className="error">{errors.username && touched.username && errors.username}</p>
                </div>

                <div className="input-signup">
                  <span>Email Address</span>
                  <MDBInput
                    wrapperClass="input-field2"
                    id="email"
                    name="email"
                    type="email"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                  />
                  <p className="error">{errors.email && touched.email && errors.email}</p>
                </div>

                <div className="input-signup">
                  <span>Password</span>
                  <MDBInput
                    wrapperClass="input-field2"
                    id="password"
                    name="password"
                    type="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  <p className="error">{errors.password && touched.password && errors.password}</p>
                </div>

                <div className="input-signup">
                  <span>Repeat Password</span>
                  <MDBInput
                    wrapperClass="input-field2"
                    id="repeat_password"
                    name="repeat_password"
                    type="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.repeat_password}
                  />
                  <p className="error">
                    {errors.repeat_password && touched.repeat_password && errors.repeat_password}
                  </p>
                </div>

                <div className="signup-button-container">
                  <MDBBtn className="signup-button" color="dark" type="submit">
                    <span>SIGN UP</span>
                  </MDBBtn>
                </div>
              </Form>
            )}
          </Formik>

          <div className="back-button-container">
            <MDBBtn className="back-button" color="dark" onClick={() => navigate(-1)}>
              <span>← Go Back</span>
            </MDBBtn>
          </div>
        </MDBCard>
      </div>
    </MDBContainer>
  );
}

<<<<<<< HEAD
export default SignUpPage;
=======
export default SignUpPage;


// import React from 'react';
// import { useNavigate} from "react-router-dom"; // Import useNavigate
// import "./SignUpPage.css";

// import {
//   MDBContainer,
//   MDBCard,
//   MDBInput,
//   MDBBtn,
// } from 'mdb-react-ui-kit';

// function SignUpPage() {
//   const navigate = useNavigate(); // Hook for navigation

//   return (
//     <MDBContainer fluid className="signup-container">

//       {/* Left Side - Image */}
//       <div className="left-signup"></div>

//       {/* Right Side - Login Form */}
//       <div className="right-signup">
//         <MDBCard style={{ borderRadius: "15px", maxWidth: "500px", width: "100%" }}>

//           {/* Title */}
//           <h6 className="signup-title">SIGN UP</h6>

//           {/* Inputs */}
//           <div className="input-signup">
//             <span>Username</span>
//               <MDBInput wrapperClass="input-field2" id="username" label="" type="username"/>
//           </div>

//           <div className="input-signup">
//             <span>Email Address</span>
//               <MDBInput wrapperClass="input-field2" id="email" label="" type="email"/>
//           </div>

//           <div className="input-signup">
//             <span>Password</span>
//               <MDBInput wrapperClass="input-field2" id="password" label="" type="password"/>
//           </div>

//           {/* Sign UP Button */}
//           <div className="signup-button-container">
//             <MDBBtn className="signup-button" color="dark">
//               <span>SIGN UP</span>
//             </MDBBtn>
//           </div>

//           {/* Back Button */}
//           <div className="back-button-container">
//             <MDBBtn className="back-button" color="dark" onClick={() => navigate(-1)}>
//               <span>← Go Back</span>
//             </MDBBtn>
//           </div>

//         </MDBCard>
//       </div>
//     </MDBContainer>
//   );
// }

// export default SignUpPage;
>>>>>>> 2fb5340052fcd276b9598069452a61be6d86f7c1
