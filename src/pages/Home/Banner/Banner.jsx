const Banner = () => {
    return (
        <div>
            <div className="bg-[#DCE8F5] font-dmsans pt-12 sm:pt-16 md:pt-20 lg:pt-[103px] pb-20 sm:pb-32 md:pb-40 lg:pb-[200px]">
                <div className="max-w-[1250px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 lg:gap-4">
                    {/* Text Content */}
                    <div className="w-full lg:w-1/2">
                        <h2 className="font-bold text-3xl sm:text-4xl md:text-[40px] lg:text-[45px] leading-tight">
                            <p className="text-[#5C5B8F]">Smart Tech</p>
                            <p className="text-[#161E64]">Smarter Learning</p>
                            <p className="text-[#5E5BFB]">Infinite Possibilities</p>
                        </h2>
                        <p className="text-[#5F5B5B] pt-6 md:pt-8 lg:pt-[30px] text-sm sm:text-base leading-relaxed">
                            From classrooms to lifelong learning, EduGrid supports every step of your learning journey. With real-time progress and a user-friendly experience, we're redefining education for a smarter tomorrow.
                        </p>
                        <div className="pt-8 md:pt-12 lg:pt-[76px]">
                            {/* <input type="text" name="search" id="" placeholder="what do u want to learn" className="pl-[58px] pr-[94px] bg-white py-[20px] font-medium text-[22px] text-[#868181] rounded-l-[11px]" />
                            <button className="bg-[#423FE5] text-white font-medium text-[22px] py-[20px] px-[28px] rounded-r-[11px]">Search Course</button> */}
                        </div>
                    </div>

                    {/* Images Section */}
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-between gap-4 sm:gap-6">
                        <img
                            src="BannerImg/banner1.jpg"
                            className="w-[45%] sm:w-[45%] md:w-[278px] h-[250px] sm:h-[300px] md:h-[350px] rounded-tr-0 rounded-bl-0 rounded-br-[30px] sm:rounded-br-[40px] md:rounded-br-[50px] rounded-tl-[30px] sm:rounded-tl-[40px] md:rounded-tl-[50px] self-end object-cover"
                            style={{
                                animation: 'float 3s ease-in-out infinite',
                            }}
                            alt="EduGrid Learning Platform"
                        />
                        <img
                            src="BannerImg/banner2.jpg"
                            className="w-[45%] sm:w-[45%] md:w-[278px] h-[250px] sm:h-[300px] md:h-[350px] rounded-tr-[30px] sm:rounded-tr-[40px] md:rounded-tr-[50px] rounded-bl-[30px] sm:rounded-bl-[40px] md:rounded-bl-[50px] rounded-br-0 rounded-tl-0 object-cover"
                            style={{
                                animation: 'float 3s ease-in-out infinite',
                                animationDelay: '1.5s',
                            }}
                            alt="Smart Learning Technology"
                        />
                    </div>
                </div>
            </div>

            {/* Float Animation Keyframes */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }
            `}</style>
        </div>
    );
};

export default Banner;
