import React, { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

interface FAQItem {
    question: string
    answer: string
}

const faqs: FAQItem[] = [
    {
        question: 'What copywriting services do you offer?',
        answer:
            'I provide a wide range of copywriting services, including video scripts, brand storytelling, email campaigns, content marketing, social media copy, product descriptions, landing page copy, ad copy, and SEO content.',
    },
    {
        question: 'How long does a project usually take?',
        answer:
            'Timelines vary depending on project complexity. Smaller tasks like social media copy typically take 2–3 business days, while larger projects such as brand storytelling can take 1–2 weeks.',
    },
    {
        question: 'How can I book your copywriting services?',
        answer:
            'You can reach out via the contact form on this website or directly through email/WhatsApp. We will discuss your project needs first, then I will share a tailored quotation.',
    },
    {
        question: 'Do you include revisions for each project?',
        answer:
            'Yes, every project includes up to 2 rounds of revisions for free. Additional revisions can be discussed with an agreed extra fee.',
    },
    {
        question: 'What payment terms do you use?',
        answer:
            'I usually work with a 50% upfront deposit and 50% upon project completion. For larger projects, payments can be split into several milestones based on our agreement.',
    },
    {
        question: 'Can I have a consultation before placing an order?',
        answer:
            'Absolutely. I offer a free consultation session to better understand your needs and goals. Feel free to contact me to schedule a call.',
    },
]

const FAQSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="py-20" id="faq">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Title & Illustration */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-semibold text-slate-800">
                                Frequently asked{' '}
                                <span className="text-sky-500">questions!</span>
                            </h2>
                            <p className="text-gray-500 mt-4 max-w-md">
                                Find quick answers to the most common questions about my services, process, and how we can work together.
                            </p>
                        </div>

                        {/* Illustration */}
                        <div className="flex justify-center lg:justify-start">
                            <img
                                src="/illustration.png"
                                alt="FAQ Illustration"
                                className="w-120 h-auto object-contain"
                            />
                        </div>
                    </div>

                    {/* Right Column - FAQ Accordion */}
                    <div className="space-y-0 p-4 rounded-xl bg-white shadow-lg">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="border-b border-gray-200"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full py-5 flex items-center justify-between text-left transition-colors"
                                >
                                    <span className="text-slate-800 font-medium text-sm md:text-base pr-4">
                                        {faq.question}
                                    </span>
                                    <span className="flex-shrink-0 text-gray-400">
                                        {openIndex === index ? (
                                            <Minus className="w-5 h-5" />
                                        ) : (
                                            <Plus className="w-5 h-5" />
                                        )}
                                    </span>
                                </button>

                                {/* Answer - Collapsible */}
                                <div
                                    className={`overflow-hidden transition-all ml-5 duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-5' : 'max-h-0'
                                        }`}
                                >
                                    <p className="text-gray-500 text-sm leading-relaxed pr-8">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FAQSection
