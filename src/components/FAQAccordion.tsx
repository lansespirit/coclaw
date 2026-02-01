import { Accordion, AccordionItem } from '@heroui/react';
import { IconPlus } from './icons';

interface FAQItemProps {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItemProps[];
}

export const FAQAccordion = ({ faqs }: FAQAccordionProps) => {
  return (
    <Accordion
      variant="splitted"
      className="px-0 gap-4"
      selectionMode="multiple"
      itemClasses={{
        base: 'm-card-surface border-divider shadow-none px-4',
        title: 'text-lg font-bold text-foreground py-2',
        trigger: 'py-4',
        content: 'text-default-700 dark:text-default-500 pb-6 pt-0 leading-relaxed',
        indicator: 'text-primary text-xl font-light',
      }}
    >
      {faqs.map((faq, index) => (
        <AccordionItem
          key={index}
          aria-label={faq.question}
          title={faq.question}
          indicator={({ isOpen }) => (
            <div
              className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0 text-default-400'}`}
            >
              <IconPlus className="w-6 h-6" aria-hidden="true" />
            </div>
          )}
        >
          {faq.answer}
        </AccordionItem>
      ))}
    </Accordion>
  );
};
