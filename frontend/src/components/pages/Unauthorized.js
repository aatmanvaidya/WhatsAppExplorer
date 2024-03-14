import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";


const Unauthorized = () => {
    const navigate = useNavigate();
    const goBack = () => navigate(-1);
    return (
        <div>
            <h1>Unauthorized</h1>
            <p>You are not authorized to access this page</p>
            <Button onClick={goBack}>Go Back</Button>
        </div>
    );
}

export default Unauthorized;