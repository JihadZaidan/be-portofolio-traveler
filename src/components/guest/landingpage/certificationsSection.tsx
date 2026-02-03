import React from 'react'

interface Certification {
    id: number
    logo: string
    title: string
    subtitle: string
    organization: string
}

const certifications: Certification[] = [
    {
        id: 1,
        logo: '/EF-Logo.png',
        title: 'EF SET English Certification',
        subtitle: 'C2 Proficient',
        organization: 'EF Standard English Test'
    },
    {
        id: 2,
        logo: '/Google-Logo.png',
        title: 'The Fundamentals of Digital Marketing',
        subtitle: '',
        organization: 'Google'
    },
    {
        id: 3,
        logo: '/Google-Logo.png',
        title: 'The Fundamentals of Digital Marketing',
        subtitle: '',
        organization: 'Google'
    }
]

const CertificationsSection: React.FC = () => {
    return (
        <section className="relative py-4 mt-12 overflow-hidden" id="certifications">
            {/* Background with overlay image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('/bg-certifications.jpg')` }}
            />

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-6 items-center gap-8">
                    {/* Title */}
                    <div className="md:col-span-2 text-left">
                        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-tight">
                            Let's Have a Look at my<br />
                            <span className="text-sky-500">Professional Certifications</span>.
                        </h2>
                    </div>

                    {/* Certification Cards */}
                    <div
                        className="md:col-span-4 flex flex-col md:flex-row gap-4 overflow-x-auto scrollbar-hide p-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {certifications.map((cert) => (
                            <div
                                key={cert.id}
                                className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-shadow duration-300 flex-shrink-0 w-[270px]"
                            >
                                {/* Logo */}
                                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-sky-50 rounded-full">
                                    <img
                                        src={cert.logo}
                                        alt={cert.title}
                                        className="w-8 h-8 object-contain"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex flex-col min-w-0 flex-1">
                                    <h3 className="text-sm font-semibold text-slate-900 leading-tight truncate mb-2">
                                        {cert.title}
                                    </h3>
                                    {cert.subtitle && (
                                        <span className="text-xs text-slate-700 font-medium mt-0.5 truncate">
                                            {cert.subtitle}
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400 mt-0.5 truncate">
                                        {cert.organization}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CertificationsSection
