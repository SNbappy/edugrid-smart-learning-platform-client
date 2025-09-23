import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    MdEmail,
    MdPhone,
    MdLocationOn,
    MdAccessTime,
    MdSend,
    MdQuestionAnswer,
    MdSupport,
    MdSchool,
    MdChat,
    MdLanguage,
    MdCheckCircle,
    MdArrowForward,
    MdExpandMore,
    MdExpandLess
} from 'react-icons/md';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: ''
    });

    const [expandedFaq, setExpandedFaq] = useState(null);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Handle form submission here
        alert('Message sent successfully! We\'ll get back to you within 24 hours.');
        setFormData({
            name: '',
            email: '',
            subject: '',
            category: '',
            message: ''
        });
    };

    const contactMethods = [
        {
            icon: MdEmail,
            title: 'Email Support',
            description: 'Get help via email',
            contact: 'support@edugrid.com',
            responseTime: 'Response within 24 hours',
            color: 'from-blue-500 to-blue-600'
        },
        {
            icon: MdPhone,
            title: 'Phone Support',
            description: 'Talk to our team',
            contact: '+880 1234-567890',
            responseTime: 'Mon-Fri, 9AM-6PM',
            color: 'from-emerald-500 to-emerald-600'
        },
        {
            icon: MdChat,
            title: 'Live Chat',
            description: 'Chat with us instantly',
            contact: 'Available on website',
            responseTime: 'Real-time support',
            color: 'from-purple-500 to-purple-600'
        },
        {
            icon: MdLocationOn,
            title: 'Visit Our Office',
            description: 'Meet us in person',
            contact: 'Dhaka, Bangladesh',
            responseTime: 'By appointment only',
            color: 'from-orange-500 to-orange-600'
        }
    ];

    const faqs = [
        {
            question: 'How do I join a classroom?',
            answer: 'To join a classroom, you need the class code from your instructor. Go to "All Classes" page, find the class you want to join, click "Join Class" and enter the 6-character code provided by your teacher.'
        },
        {
            question: 'What if I forgot my password?',
            answer: 'Click on "Forgot Password" on the login page. Enter your email address and we\'ll send you a reset link. Check your email (including spam folder) and follow the instructions to create a new password.'
        },
        {
            question: 'How do I create a new classroom?',
            answer: 'As an instructor, go to your dashboard and click "Create Classroom". Fill in the classroom details including name, subject, description, and upload an image. Once created, you\'ll get a unique class code to share with students.'
        },
        {
            question: 'Can I access EduGrid on mobile?',
            answer: 'Yes! EduGrid is fully responsive and works perfectly on all devices including smartphones and tablets. You can access all features through your mobile browser.'
        },
        {
            question: 'Is EduGrid free to use?',
            answer: 'Yes, EduGrid is completely free for both students and instructors. You can create unlimited classrooms, join multiple classes, and access all our learning features at no cost.'
        },
        {
            question: 'How do I upload materials to my classroom?',
            answer: 'In your classroom dashboard, navigate to the "Materials" section. Click "Upload Material", select your files, and add a title and description. Supported formats include PDF, images, and documents.'
        }
    ];

    const toggleFaq = (index) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-[#DCE8F5]">
            <Helmet>
                <title>Contact Us | EduGrid - We're Here to Help</title>
                <meta name="description" content="Get in touch with EduGrid support team. We're here to help with any questions about our smart learning platform." />
            </Helmet>

            {/* Hero Section */}
            <section className="relative py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full text-blue-700 font-medium mb-8 shadow-lg">
                            <MdSupport className="mr-2" />
                            We're Here to Help
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-slate-900 mb-8 tracking-tight">
                            Get in
                            <span className="block font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Touch
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-700 max-w-4xl mx-auto leading-relaxed mb-12">
                            Have questions about EduGrid? Need technical support? Want to share feedback?
                            We'd love to hear from you and help make your learning experience even better.
                        </p>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                                <div className="text-3xl font-bold text-slate-900 mb-2">24h</div>
                                <div className="text-sm text-slate-600 font-medium">Average Response Time</div>
                            </div>
                            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                                <div className="text-3xl font-bold text-slate-900 mb-2">98%</div>
                                <div className="text-sm text-slate-600 font-medium">Customer Satisfaction</div>
                            </div>
                            <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                                <div className="text-3xl font-bold text-slate-900 mb-2">24/7</div>
                                <div className="text-sm text-slate-600 font-medium">Support Available</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Methods */}
            {/* <section className="py-20 bg-white/40 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Choose Your Preferred Way</h2>
                        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                            Multiple ways to reach us, so you can get help however you prefer
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {contactMethods.map((method, index) => (
                            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group text-center">
                                <div className={`w-16 h-16 bg-gradient-to-r ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                                    <method.icon className="text-white text-2xl" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">{method.title}</h3>
                                <p className="text-slate-600 mb-3">{method.description}</p>
                                <p className="font-semibold text-slate-800 mb-2">{method.contact}</p>
                                <p className="text-sm text-slate-500">{method.responseTime}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section> */}

            {/* Contact Form & Info */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Contact Form */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-xl">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-slate-900 mb-4">Send us a Message</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    Fill out the form below and we'll get back to you as soon as possible.
                                    All fields marked with * are required.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                                            Category *
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        >
                                            <option value="">Select a category</option>
                                            <option value="technical">Technical Support</option>
                                            <option value="account">Account Issues</option>
                                            <option value="classroom">Classroom Help</option>
                                            <option value="billing">Billing Question</option>
                                            <option value="feedback">Feedback & Suggestions</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="Brief subject"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                                        placeholder="Describe your question or issue in detail..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold text-lg flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                                >
                                    <MdSend className="mr-2" />
                                    Send Message
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-8">
                            {/* Office Info */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
                                <h3 className="text-2xl font-bold text-slate-900 mb-6">Our Office</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <MdLocationOn className="text-white text-xl" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Address</p>
                                            <p className="text-slate-600">
                                                House #123, Road #456<br />
                                                Dhanmondi, Dhaka-1205<br />
                                                Bangladesh
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <MdAccessTime className="text-white text-xl" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Office Hours</p>
                                            <p className="text-slate-600">
                                                Monday - Friday: 9:00 AM - 6:00 PM<br />
                                                Saturday: 10:00 AM - 4:00 PM<br />
                                                Sunday: Closed
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
                                <h3 className="text-2xl font-bold text-slate-900 mb-6">Quick Help</h3>
                                <div className="space-y-4">
                                    <a href="#" className="flex items-center space-x-3 text-slate-600 hover:text-blue-600 transition-colors group">
                                        <MdSchool className="text-blue-500 group-hover:scale-110 transition-transform" />
                                        <span>Getting Started Guide</span>
                                        <MdArrowForward className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                    <a href="#" className="flex items-center space-x-3 text-slate-600 hover:text-blue-600 transition-colors group">
                                        <MdQuestionAnswer className="text-blue-500 group-hover:scale-110 transition-transform" />
                                        <span>Frequently Asked Questions</span>
                                        <MdArrowForward className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                    <a href="#" className="flex items-center space-x-3 text-slate-600 hover:text-blue-600 transition-colors group">
                                        <MdSupport className="text-blue-500 group-hover:scale-110 transition-transform" />
                                        <span>Help Center</span>
                                        <MdArrowForward className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                    <a href="#" className="flex items-center space-x-3 text-slate-600 hover:text-blue-600 transition-colors group">
                                        <MdLanguage className="text-blue-500 group-hover:scale-110 transition-transform" />
                                        <span>Community Forum</span>
                                        <MdArrowForward className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </div>
                            </div>

                            {/* Success Message */}
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
                                <div className="flex items-start space-x-3">
                                    <MdCheckCircle className="text-emerald-600 text-xl flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-emerald-800">We're here to help!</p>
                                        <p className="text-emerald-700 text-sm mt-1">
                                            Our support team typically responds within 24 hours. For urgent matters,
                                            please call us directly during office hours.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-white/40 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
                        <p className="text-lg text-slate-600">
                            Quick answers to common questions about EduGrid
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/50 transition-colors"
                                >
                                    <span className="font-semibold text-slate-900">{faq.question}</span>
                                    {expandedFaq === index ? (
                                        <MdExpandLess className="text-blue-600 text-xl" />
                                    ) : (
                                        <MdExpandMore className="text-slate-400 text-xl" />
                                    )}
                                </button>
                                {expandedFaq === index && (
                                    <div className="px-6 pb-4">
                                        <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {/* <section className="py-20 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Still Have Questions?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 leading-relaxed">
                        Our support team is standing by to help you succeed with EduGrid
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="inline-flex items-center px-8 py-4 bg-white text-slate-900 rounded-2xl hover:bg-gray-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                            <MdChat className="mr-2" />
                            Start Live Chat
                        </button>
                        <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-2xl hover:bg-white hover:text-slate-900 transition-all duration-300 font-semibold">
                            <MdPhone className="mr-2" />
                            Call Support
                        </button>
                    </div>
                </div>
            </section> */}
        </div>
    );
};

export default Contact;
