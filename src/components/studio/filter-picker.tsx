import { RadioGroup, type RadioOption } from "@/components/ui/radio-group";
import { filterOrder, filters } from "@/lib/filters";
import type { FilterId } from "@/lib/types";

interface FilterPickerProps {
  value: FilterId;
  onChange: (value: FilterId) => void;
}

const options: readonly RadioOption<FilterId>[] = filterOrder.map((id) => ({
  value: id,
  label: filters[id].label,
  visual: (
    <span
      className="relative block h-8 w-10 overflow-hidden rounded-[2px] border border-rule bg-paper"
      style={{ filter: filters[id].css }}
    >
      <span className="absolute inset-x-1 top-1 h-2 rounded-full bg-brick/90" />
      <span className="absolute top-3 left-1 size-3 rounded-full bg-gold" />
      <span className="absolute top-4 right-1 h-2 w-4 rounded-full bg-sage" />
      <span className="absolute inset-x-1 bottom-1 h-1 bg-ink/70" />
    </span>
  ),
}));

export const FilterPicker = ({ value, onChange }: FilterPickerProps) => (
  <RadioGroup
    name="studio-tone"
    legend="Tone"
    value={value}
    onValueChange={onChange}
    options={options}
    groupClassName="grid-cols-4 gap-1.5 sm:grid-cols-7"
    optionClassName="min-h-[4.4rem] flex-col gap-1 px-1 py-1.5 text-center text-[0.6875rem]"
  />
);
