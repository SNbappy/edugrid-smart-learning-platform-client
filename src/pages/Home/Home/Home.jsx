import { Helmet } from "react-helmet-async";
import Banner from "../Banner/Banner";

const Home = () => {
    return (
        
        <div>
            <Helmet>
                <title>EduGrid</title>
            </Helmet>
            <div>
                <Banner/>
            </div>
        </div>
    );
};

export default Home;