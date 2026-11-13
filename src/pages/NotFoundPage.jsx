import {Link} from "react-router-dom";

function NotFoundPage() {
    return (
        <div>
            <h1>Page not found</h1>
            <p>This address does not exist</p>
            <Link to="/">Home</Link>
        </div>
    );
}

export default NotFoundPage;