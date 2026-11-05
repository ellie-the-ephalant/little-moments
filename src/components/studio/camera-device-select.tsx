import type { UseCameraResult } from "@/hooks/use-camera";

interface CameraDeviceSelectProps {
  camera: Pick<
    UseCameraResult,
    "devices" | "activeDeviceId" | "selectDevice" | "status"
  >;
  isDisabled: boolean;
}

export const CameraDeviceSelect = ({
  camera,
  isDisabled,
}: CameraDeviceSelectProps) => {
  if (camera.devices.length <= 1) return null;

  return (
    <label
      htmlFor="studio-camera-device"
      className="grid gap-2 text-sm font-semibold text-ink"
    >
      Camera
      <select
        id="studio-camera-device"
        value={camera.activeDeviceId ?? ""}
        disabled={isDisabled || camera.status === "requesting"}
        onChange={(event) =>
          void camera.selectDevice(event.currentTarget.value)
        }
        className="min-h-12 w-full rounded-control border border-rule bg-paper px-3 text-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="" disabled>
          Choose a camera
        </option>
        {camera.devices.map((device, index) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Camera ${index + 1}`}
          </option>
        ))}
      </select>
    </label>
  );
};
