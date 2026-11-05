import { RadioGroup, type RadioOption } from "@/components/ui/radio-group";
import { themeOrder, themes } from "@/lib/themes";
import type { ThemeId } from "@/lib/types";

interface ThemePickerProps {
  value: ThemeId;
  onChange: (value: ThemeId) => void;
}

const options: readonly RadioOption<ThemeId>[] = themeOrder.map((id) => {
  const theme = themes[id];
  return {
    value: id,
    label: theme.label,
    visual: (
      <span
        className="relative block h-10 w-8 overflow-hidden border"
        style={{ backgroundColor: theme.bg, borderColor: theme.border }}
      >
        <span
          className="absolute inset-x-1 top-1 h-2 border-b"
          style={{ borderColor: theme.accent }}
        />
        <span
          className="absolute inset-x-1 top-4 bottom-1 border"
          style={{ backgroundColor: theme.paper, borderColor: theme.border }}
        >
          <span
            className="absolute top-1 left-1 h-1 w-3/5"
            style={{ backgroundColor: theme.ink }}
          />
          <span
            className="absolute right-1 bottom-1 size-1.5 rounded-full"
            style={{ backgroundColor: theme.accent }}
          />
        </span>
      </span>
    ),
  };
});

export const ThemePicker = ({ value, onChange }: ThemePickerProps) => (
  <RadioGroup
    name="studio-paper"
    legend="Paper"
    value={value}
    onValueChange={onChange}
    options={options}
    groupClassName="grid-cols-3 gap-1.5 sm:grid-cols-6"
    optionClassName="min-h-[4.5rem] flex-col gap-1 px-1 py-1.5 text-center text-[0.6875rem]"
  />
);
