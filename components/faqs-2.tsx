'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

export default function FAQsTwo() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'How does OwnMarket keep buyers safe?',
            answer: 'OwnMarket connects buyers directly with verified sellers. We display transparent seller profiles, listing history, and public reputation signals so buyers can make informed decisions before trading.',
          },
          {
            id: 'item-2',
            question: 'Do you handle payments or hold funds?',
            answer: 'No. OwnMarket does not process payments or hold funds. All transactions happen directly between buyer and seller. We recommend confirming terms clearly before completing any trade.',
          },
          {
            id: 'item-3',
            question: 'How are sellers verified?',
            answer: 'Sellers must create a verified account before listing products. We track account history, activity consistency, and marketplace behavior. Trusted sellers earn badges based on reliability and performance.',
          },
          {
            id: 'item-4',
            question: 'What should I do before trading?',
            answer: 'Always communicate clearly, confirm pricing and delivery terms, and use trusted payment methods. Review the seller’s profile and past listings to ensure legitimacy before proceeding.',
          },
          {
            id: 'item-5',
            question: 'What makes OwnMarket trustworthy?',
            answer: 'OwnMarket is built to increase transparency in Discord-based trading. Instead of random DMs, buyers can discover structured listings, public seller profiles, and organized marketplace visibility in one place.',
          },
          
    ]

    return (
        <section id="faq" className="py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="mx-auto max-w-xl text-center">
                    <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground mt-4 text-balance">Discover quick and comprehensive answers to common questions about our platform, services, and features.</p>
                </div>

                <div className="mx-auto mt-12 max-w-xl">
                    <Accordion
                        type="single"
                        collapsible
                        className="bg-card ring-muted w-full rounded-2xl border px-8 py-3 shadow-sm ring-4 dark:ring-0">
                        {faqItems.map((item) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border-dashed">
                                <AccordionTrigger className="cursor-pointer text-base hover:no-underline">{item.question}</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-base">{item.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <p className="text-muted-foreground mt-6 px-8">
                        Can&apos;t find what you&apos;re looking for?{' '}
                        <Link
                            href="/support"
                            className="text-primary font-medium hover:underline">
                            Customer support
                        </Link>
                        {' '}or{' '}
                        <Link
                            href="/contact"
                            className="text-primary font-medium hover:underline">
                            contact us
                        </Link>.
                    </p>
                </div>
            </div>
        </section>
    )
}
