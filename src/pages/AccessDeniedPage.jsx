import {Link} from "react-router-dom";

function AccessDeniedPage() {
    return (
        <div>
            <h1>Access denied</h1>
            <p>You do not have permission to access this page</p>
            <Link to="/">Home</Link>
        </div>
    );
}

export default AccessDeniedPage;