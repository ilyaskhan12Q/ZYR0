import { Spinner } from '@/components/ui/spinner';

export function RouteLoading() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center">
      <Spinner className="size-8 text-primary animate-spin" />
    </div>
  );
}
