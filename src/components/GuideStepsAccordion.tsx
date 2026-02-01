import { Accordion, AccordionItem } from '@heroui/react';

export interface GuideStep {
  title: string;
  content: string;
}

interface GuideStepsAccordionProps {
  steps: GuideStep[];
}

export const GuideStepsAccordion = ({ steps }: GuideStepsAccordionProps) => {
  return (
    <Accordion
      variant="light"
      className="px-4 py-2"
      selectionMode="multiple"
      defaultExpandedKeys={['step-1']}
    >
      {steps.map((step, index) => {
        const key = `step-${index + 1}`;
        return (
          <AccordionItem
            key={key}
            aria-label={step.title}
            title={`Step ${index + 1}: ${step.title}`}
            classNames={{ title: 'font-bold text-lg' }}
          >
            <div className="pb-6 text-default-700 leading-relaxed">{step.content}</div>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
