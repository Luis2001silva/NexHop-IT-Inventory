
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Edit, FileText, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';

const InvoiceList = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    setLoading(true);

    const { data, error } = await supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        invoice_date,
        total_amount,
        equipment_id,
        supplier
      `)
      .order("invoice_date", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setInvoices(data ?? []);
    setLoading(false);
  }
  
  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.supplier ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        {t('loading')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('invoiceList')}</h2>
        {isAdmin && (
          <Button asChild>
            <Link to="/invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('addInvoice')}
            </Link>
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`${t('search')}...`}
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredInvoices.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('invoiceNumber')}</TableHead>
                <TableHead>{t('invoiceDate')}</TableHead>
                <TableHead>{t('supplier')}</TableHead>
                <TableHead>{t('equipment')}</TableHead>
                <TableHead>{t('totalAmount')}</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{invoice.equipment_id ?? '-'}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-PT', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(invoice.total_amount ?? 0)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      asChild
                    >
                      <Link to={`/invoices/${invoice.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">{t('noInvoicesFound')}</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
