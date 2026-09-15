import { useParams } from 'react-router-dom';
import EquipmentList from '@/components/Equipment/EquipmentList';
import EquipmentDetail from '@/components/Equipment/EquipmentDetail';

const EquipmentPage = () => {
  const { id } = useParams();
  
  // If there's an ID parameter, show the detail view
  // Otherwise show the list view with tabs for different equipment types
  return id ? <EquipmentDetail /> : <EquipmentList />;
};

export default EquipmentPage;
