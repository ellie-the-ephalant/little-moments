import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PhotoUploadButtonProps {
  isDisabled: boolean;
  onClick: () => void;
  className?: string;
}

export const PhotoUploadButton = ({
  isDisabled,
  onClick,
  className,
}: PhotoUploadButtonProps) => (
  <Button
    variant="secondary"
    disabled={isDisabled}
    className={className}
    onClick={onClick}
  >
    <Upload aria-hidden="true" />
    Upload photos instead
  </Button>
);
