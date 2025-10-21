import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MdEmail, MdPhone, MdLocationOn, MdSend } from 'react-icons/md';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log('Form submitted:', formData);
        alert('Message sent successfully! We\'ll get back to you within 24 hours.');
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
        });
    };

    return (
        <div className="min-h-screen bg-[#DCE8F5] text-black">
            <Helmet>
                <title>Contact Us | EduGrid - Smart Learning Platform</title>
                <meta name="description" content="Get in touch with EduGrid support team. We're here to help with any questions about our smart learning platform." />
            </Helmet>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                        Get in Touch
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                        Have questions or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Contact Form */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-6 sm:p-8 shadow-sm">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

                        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-[#457B9D] text-sm sm:text-base"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-[#457B9D] text-sm sm:text-base"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-[#457B9D] text-sm sm:text-base"
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    rows={5}
                                    className="w-full px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-[#457B9D] resize-none text-sm sm:text-base"
                                    placeholder="Tell us more about your question or feedback..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#457B9D] text-white py-3 sm:py-3.5 px-6 rounded-lg hover:bg-[#3a6b8a] transition-colors font-semibold flex items-center justify-center text-sm sm:text-base"
                            >
                                <MdSend className="mr-2 text-lg" />
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        {/* Contact Details */}
                        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Contact Information</h3>

                            <div className="space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#457B9D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MdEmail className="text-[#457B9D] text-lg sm:text-xl" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Email</p>
                                        <p className="text-gray-600 text-sm sm:text-base">support@edugrid.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#457B9D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MdPhone className="text-[#457B9D] text-lg sm:text-xl" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Phone</p>
                                        <p className="text-gray-600 text-sm sm:text-base">+880 1921-024590</p>
                                        <p className="text-gray-500 text-xs sm:text-sm mt-1">Mon-Fri, 9AM-6PM</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#457B9D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MdLocationOn className="text-[#457B9D] text-lg sm:text-xl" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Address</p>
                                        <p className="text-gray-600 text-sm sm:text-base">
                                            Dhaka, Bangladesh
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Response Time */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 sm:p-6">
                            <p className="text-sm sm:text-base text-gray-700">
                                <span className="font-semibold text-gray-900">Quick Response:</span> We typically respond within 24 hours on business days.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
