import { DashboardContent } from '../../components/dashboard';
import { ReportLayout } from '../../components/jubaesi_reportHandler';

export default function UploadPage() {
    return(
        <ReportLayout />
    )
}

UploadPage.getLayout = function getLayout() {
    return (
      <DashboardContent />
    )
}