import { RadioGroup, type RadioOption } from "@/components/ui/radio-group";
import { layoutOrder, layouts } from "@/lib/layouts";
import type { LayoutId } from "@/lib/types";

interface LayoutPickerProps {
  value: LayoutId;
  onChange: (value: LayoutId) => void;
}

const options: readonly RadioOption<LayoutId>[] = layoutOrder.map((id) => {
  const layout = layouts[id];
  return {
    value: id,
    label: layout.shortLabel,
    visual: (
      <span
        className="grid size-9 gap-0.5 rounded-[2px] border border-rule bg-cream p-1"
        style={{
          gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: layout.cols * layout.rows }, (_, index) => (
          <span
            key={`${id}-${index}`}
            className="rounded-[1px] border border-rule bg-paper-deep"
          />
        ))}
      </span>
    ),
  };
});

export const LayoutPicker = ({ value, onChange }: LayoutPickerProps) => (
  <RadioGroup
    name="studio-layout"
    legend="Layout"
    value={value}
    onValueChange={onChange}
    options={options}
    groupClassName="grid-cols-5 gap-1.5"
    optionClassName="min-h-[4.75rem] flex-col gap-1 px-1 py-1.5 text-center text-xs"
  />
);
