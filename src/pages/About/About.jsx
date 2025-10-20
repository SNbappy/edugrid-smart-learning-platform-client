import { Helmet } from 'react-helmet-async';
import { MdSchool, MdPeople, MdLightbulb } from 'react-icons/md';

const About = () => {
    const features = [
        {
            icon: MdLightbulb,
            title: 'Quality Education',
            description: 'Access to high-quality courses designed by industry experts and experienced educators.'
        },
        {
            icon: MdPeople,
            title: 'Expert Community',
            description: 'Learn from qualified instructors and connect with fellow students worldwide.'
        },
        {
            icon: MdSchool,
            title: 'Flexible Learning',
            description: 'Study at your own pace with 24/7 access to course materials and resources.'
        }
    ];

    return (
        <div className="min-h-screen bg-[#DCE8F5]">
            <Helmet>
                <title>About Us | EduGrid - Smart Learning Platform</title>
                <meta name="description" content="Learn about EduGrid's mission to transform education through innovative technology and exceptional learning experiences." />
            </Helmet>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                {/* Hero Section */}
                <div className="text-center mb-12 sm:mb-16 lg:mb-20">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                        About EduGrid
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto px-4">
                        We're dedicated to making quality education accessible to everyone, everywhere.
                        Through innovative technology and passionate educators, we're building the future of learning.
                    </p>
                </div>

                {/* Features Section */}
                <div className="mb-12 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3 sm:mb-4">
                        Why Choose EduGrid?
                    </h2>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 text-center mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
                        Discover what makes our platform the preferred choice for learners
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#457B9D]/10 rounded-lg flex items-center justify-center mb-4 sm:mb-5">
                                    <feature.icon className="text-[#457B9D] text-2xl sm:text-3xl" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mission & Vision Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
                    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-lg flex items-center justify-center mb-4 sm:mb-5">
                            <MdSchool className="text-blue-600 text-2xl sm:text-3xl" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                            Our Mission
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                            To democratize education by providing accessible, high-quality learning experiences
                            that empower individuals to achieve their full potential and create positive impact
                            in their communities.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-50 rounded-lg flex items-center justify-center mb-4 sm:mb-5">
                            <MdLightbulb className="text-green-600 text-2xl sm:text-3xl" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                            Our Vision
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                            To become a leading smart learning platform where technology and human expertise
                            converge to create transformative educational experiences that shape the future
                            of learning.
                        </p>
                    </div>
                </div>

                {/* Our Story Section
                <div className="bg-white rounded-xl p-6 sm:p-8 lg:p-10 shadow-sm">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
                        Our Story
                    </h2>
                    <div className="space-y-4 sm:space-y-5 text-sm sm:text-base text-gray-600 leading-relaxed">
                        <p>
                            Founded in 2024, EduGrid emerged from a simple yet powerful belief: that everyone
                            deserves access to quality education. Our founders, passionate educators and
                            technologists, recognized the need to bridge the gap between traditional learning
                            methods and the digital age.
                        </p>
                        <p>
                            Today, we're proud to serve learners across Bangladesh and beyond, offering a
                            comprehensive platform that combines the best of human expertise with cutting-edge
                            technology. Our commitment to excellence and innovation drives us to continuously
                            improve and adapt to the evolving needs of modern education.
                        </p>
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default About;
