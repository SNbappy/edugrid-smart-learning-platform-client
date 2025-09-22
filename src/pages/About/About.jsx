import { Helmet } from 'react-helmet-async';
import {
    MdSchool,
    MdPeople,
    MdLightbulb,
    MdTrendingUp,
    MdStar,
    MdVerified,
    MdRocket,
    MdSupport,
    MdPublic,
    MdArrowForward,
    MdPlayArrow,
    MdCheckCircle
} from 'react-icons/md';

const About = () => {
    const stats = [
        { number: '10,000+', label: 'Active Students', icon: MdPeople },
        { number: '500+', label: 'Expert Instructors', icon: MdSchool },
        { number: '1,000+', label: 'Courses Available', icon: MdLightbulb },
        { number: '95%', label: 'Success Rate', icon: MdTrendingUp }
    ];

    const features = [
        {
            icon: MdRocket,
            title: 'Innovative Learning',
            description: 'Cutting-edge technology meets proven educational methods to deliver exceptional learning experiences.'
        },
        {
            icon: MdPeople,
            title: 'Expert Community',
            description: 'Connect with industry professionals and passionate educators from around the world.'
        },
        {
            icon: MdSupport,
            title: '24/7 Support',
            description: 'Our dedicated support team is always here to help you succeed in your learning journey.'
        },
        {
            icon: MdPublic,
            title: 'Global Access',
            description: 'Learn from anywhere, anytime with our flexible and accessible online platform.'
        }
    ];

    const values = [
        {
            title: 'Excellence',
            description: 'We strive for the highest quality in education, ensuring every student receives world-class learning experiences.'
        },
        {
            title: 'Innovation',
            description: 'We embrace new technologies and methodologies to make learning more engaging and effective.'
        },
        {
            title: 'Accessibility',
            description: 'Education should be available to everyone, regardless of location, background, or circumstances.'
        },
        {
            title: 'Community',
            description: 'We foster a supportive learning environment where students and educators thrive together.'
        }
    ];

    return (
        <div className="min-h-screen bg-[#DCE8F5]">
            <Helmet>
                <title>About Us | EduGrid - Smart Learning Platform</title>
                <meta name="description" content="Learn about EduGrid's mission to transform education through innovative technology and exceptional learning experiences." />
            </Helmet>

            {/* Hero Section */}
            <section className="relative py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full text-blue-700 font-medium mb-8 shadow-lg">
                            <MdStar className="mr-2 text-yellow-500" />
                            Transforming Education Since 2023
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-slate-900 mb-8 tracking-tight">
                            About
                            <span className="block font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                EduGrid
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-700 max-w-4xl mx-auto leading-relaxed mb-12">
                            We're on a mission to make quality education accessible to everyone, everywhere.
                            Through innovative technology and passionate educators, we're building the future of learning.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="inline-flex items-center px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                                <MdPlayArrow className="mr-2" />
                                Watch Our Story
                            </button>
                            <button className="inline-flex items-center px-8 py-4 bg-white/80 text-slate-900 rounded-2xl hover:bg-white transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                                Join Our Community
                                <MdArrowForward className="ml-2" />
                            </button>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <stat.icon className="text-white text-2xl" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 mb-2">{stat.number}</div>
                                <div className="text-sm text-slate-600 font-medium uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-20 bg-white/40 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Our Mission & Vision</h2>
                        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                            Driven by purpose, guided by innovation
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-xl">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <MdRocket className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                To democratize education by providing accessible, high-quality learning experiences
                                that empower individuals to achieve their full potential and create positive impact
                                in their communities and beyond.
                            </p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-xl">
                            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                                <MdLightbulb className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                To become the world's leading smart learning platform, where technology and
                                human expertise converge to create transformative educational experiences
                                that shape the future of learning.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Why Choose EduGrid?</h2>
                        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                            Discover what makes our platform the preferred choice for learners worldwide
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <feature.icon className="text-white text-xl" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-white/40 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Our Core Values</h2>
                        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                            The principles that guide everything we do
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="flex items-start space-x-4 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                        <MdCheckCircle className="text-white text-xl" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{value.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{value.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                                <MdVerified className="mr-2" />
                                Our Story
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                                Building the Future of Education
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                Founded in 2023, EduGrid emerged from a simple yet powerful belief: that everyone
                                deserves access to quality education. Our founders, passionate educators and
                                technologists, recognized the need to bridge the gap between traditional learning
                                methods and the digital age.
                            </p>
                            <p className="text-lg text-slate-600 leading-relaxed mb-8">
                                Today, we're proud to serve thousands of learners across Bangladesh and beyond,
                                offering a comprehensive platform that combines the best of human expertise with
                                cutting-edge technology.
                            </p>
                            <button className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium">
                                Read Our Full Story
                                <MdArrowForward className="ml-2" />
                            </button>
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-3xl p-8 shadow-2xl">
                                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
                                    <MdSchool className="text-white text-6xl mx-auto mb-4" />
                                    <h3 className="text-white text-2xl font-bold mb-2">EduGrid Platform</h3>
                                    <p className="text-white/90">
                                        Empowering minds, one lesson at a time
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Start Your Learning Journey?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 leading-relaxed">
                        Join thousands of learners who are already transforming their lives through education
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="inline-flex items-center px-8 py-4 bg-white text-slate-900 rounded-2xl hover:bg-gray-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                            Get Started Today
                            <MdArrowForward className="ml-2" />
                        </button>
                        <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-2xl hover:bg-white hover:text-slate-900 transition-all duration-300 font-semibold">
                            <MdSupport className="mr-2" />
                            Contact Us
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
