import type {Metadata} from 'next';
import StaffDesk from './desk';
import '../account/account.css';
export const metadata:Metadata={title:'Wedding Day Staff Desk'};
export default function Page(){return <StaffDesk/>;}
