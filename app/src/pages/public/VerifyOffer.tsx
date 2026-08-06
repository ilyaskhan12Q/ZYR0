import { Navigate, useParams } from 'react-router-dom';

/**
 * Legacy /verify-offer/:id entry point — kept alive so QR codes already printed
 * on offer letters keep working. Redirects to the unified /verify page with the
 * offer tab pre-selected and the ID pre-filled.
 */
export default function VerifyOffer() {
  const { id } = useParams();

  if (id) {
    return <Navigate to={`/verify?type=offer&id=${encodeURIComponent(id)}`} replace />;
  }

  return <Navigate to="/verify?type=offer" replace />;
}