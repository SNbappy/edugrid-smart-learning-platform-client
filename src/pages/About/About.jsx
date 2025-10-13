import { Helmet } from 'react-helmet-async';
import {
    MdSchool,
    MdPeople,
    MdLightbulb,
    MdTrendingUp,
    MdArrowForward,
    MdCheckCircle
} from 'react-icons/md';

const About = () => {
    const stats = [
        // { number: '10,000+', label: 'Active Students' },
        // { number: '500+', label: 'Expert Instructors' },
        // { number: '1,000+', label: 'Courses Available' },
        // { number: '95%', label: 'Success Rate' }
    ];

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

            {/* Hero Section */}
            <section className="py-16 lg:py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        About EduGrid
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed mb-8">
                        We're dedicated to making quality education accessible to everyone,
                        everywhere. Through innovative technology and passionate educators,
                        we're building the future of learning.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            {/* <section className="py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="bg-white rounded-lg p-8 shadow-sm">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                                <MdSchool className="text-blue-600 text-xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                            <p className="text-gray-600 leading-relaxed">
                                To democratize education by providing accessible, high-quality learning
                                experiences that empower individuals to achieve their full potential and
                                create positive impact in their communities.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-8 shadow-sm">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                                <MdLightbulb className="text-green-600 text-xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
                            <p className="text-gray-600 leading-relaxed">
                                To become a leading smart learning platform where technology and human
                                expertise converge to create transformative educational experiences
                                that shape the future of learning.
                            </p>
                        </div>
                    </div>
                </div>
            </section> */}

            {/* Key Features */}
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Why Choose EduGrid?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Discover what makes our platform the preferred choice for learners
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                                    <feature.icon className="text-blue-600 text-2xl" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            {/* <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
                    </div>

                    <div className="bg-white rounded-lg p-8 shadow-sm">
                        <p className="text-lg text-gray-600 leading-relaxed mb-6">
                            Founded in 2023, EduGrid emerged from a simple yet powerful belief:
                            that everyone deserves access to quality education. Our founders,
                            passionate educators and technologists, recognized the need to bridge
                            the gap between traditional learning methods and the digital age.
                        </p>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Today, we're proud to serve thousands of learners across Bangladesh
                            and beyond, offering a comprehensive platform that combines the best
                            of human expertise with cutting-edge technology.
                        </p>
                    </div>
                </div>
            </section> */}

            {/* Call to Action */}
            {/* <section className="py-16 bg-blue-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to Start Learning?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of learners who are transforming their lives through education
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                            Get Started Today
                            <MdArrowForward className="ml-2" />
                        </button>
                        <button className="inline-flex items-center px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold">
                            Learn More
                        </button>
                    </div>
                </div>
            </section> */}
        </div>
    );
};

export default About;
