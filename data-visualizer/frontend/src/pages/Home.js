// import { useRef } from "react";
// import ParticlesBg from "particles-bg";
// import { useNavigate } from "react-router-dom";

// import background from "../assets/bg.jpg";

// const Tile = (props) => {
//   return (
//     <div
//       onClick={props.onClick}
//       style={{
//         cursor: "pointer",
//         height: "250px",
//         width: "600px",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         borderRadius: "10px",
//         background: "red",
//         color: "white",
//         margin: "40px",
//         fontSize: "1.5rem",
//         background: "linear-gradient(to right, #56ccf2, #2f80ed)",
//         ...props.style,
//       }}
//     >
//       {props.text}
//     </div>
//   );
// };

// const Home = (props) => {
//   const scrollSection = useRef(null);
//   const navigate = useNavigate();

//   return (
//     <div>
//       <div
//         style={{
//           background: "#2f80ed",
//           background: "-webkit-linear-gradient(to right, #56ccf2, #2f80ed)",
//           background: "linear-gradient(to right, #56ccf2, #2f80ed)",
//           fontFamily: "'Exo 2', sans-serif",
//           fontWeight: 800,
//           color: "white",
//           fontSize: "1.8rem",
//           textAlign: "center",
//           padding: "10px",
//           width: "100%",
//           boxSizing: "border-box",
//         }}
//       >
//         Data Analysis
//       </div>
//       <div
//         style={{
//           height: "100vh",
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           flexDirection: "column",
//           boxSizing: "border-box",
//           position: "relative",
//         }}
//       >
//         <div
//           style={{ fontSize: "1.2rem", maxWidth: "70vw", textAlign: "center" }}
//         >
//           Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
//           eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
//           minim veniam, quis nostrud exercitation ullamco laboris nisi ut
//           aliquip ex ea commodo consequat.
//         </div>
//         <div
//           style={{
//             cursor: "pointer",
//             padding: "10px 50px",
//             background: "linear-gradient(to right, #56ccf2, #2f80ed)",
//             // border: "thin solid #fc4a1a",
//             marginTop: "40px",
//             borderRadius: "30px",
//             color: "white",
//           }}
//           onClick={() => {
//             window.scrollTo({
//               top: scrollSection.current.offsetTop,
//               behavior: "smooth",
//             });
//           }}
//         >
//           View Apps
//         </div>
//         <ParticlesBg type={"ball"} bg={true} />
//       </div>
//       <div
//         ref={scrollSection}
//         style={{
//           minHeight: "100vh",
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "center",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <Tile text={"Whatsapp"} onClick={() => navigate("/whatsapp")} />
//           <Tile text={"Telegram"} onClick={() => navigate("/telegram")} />
//         </div>
//         {/* <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <Tile text={"Twitter"} onClick={() => navigate("/twitter")} />
//           <Tile text={"Reddit"} onClick={() => navigate("/reddit")} />
//         </div> */}
//       </div>
//     </div>
//   );
// };

// export default Home;
