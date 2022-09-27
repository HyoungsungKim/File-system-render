import { DashboardContent } from '../../components/dashboard';
import { RentalLayout } from '../../components/rentalHandler';

export default function UploadPage() {
    return(
        <RentalLayout />
    )
}

UploadPage.getLayout = function getLayout() {
    return (
      <DashboardContent />
    )
}