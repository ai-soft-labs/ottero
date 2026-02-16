import { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCompany, useCreateCompany, useUpdateCompany } from '@/hooks/useCompanies';
import { CompanySchema, type CompanyFormValues } from '@/types/schemas';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileUpload } from '@/components/FileUpload';
import { toast } from 'sonner';

import { useAuth0 } from '@auth0/auth0-react';
import { useApi } from '@/hooks/useApi';

export default function CompanyEditPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = !id || id === 'new';

    // Auth & API
    const { user } = useAuth0();
    const api = useApi();

    const { data: company, isLoading: isLoadingCompany } = useCompany(id);
    const createCompany = useCreateCompany();
    const updateCompany = useUpdateCompany();
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get('success') === 'stripe_connected') {
            toast.success('Stripe connected successfully!');
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('success');
            setSearchParams(newParams, { replace: true });
        } else if (searchParams.get('error') === 'stripe_connection_failed') {
            toast.error('Failed to connect Stripe account.');
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('error');
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(CompanySchema),
        defaultValues: {
            name: '',
            abn: '',
            email: '',
            phone: '',
            address: '',
            bank_bsb: '',
            bank_account: '',
            website: '',
        },
    });

    // Load data into form when fetched
    useEffect(() => {
        if (company) {
            form.reset({
                name: company.name || '',
                abn: company.abn || '',
                email: company.email || '',
                phone: company.phone || '',
                address: company.address || '',
                bank_bsb: company.bank_bsb || '',
                bank_account: company.bank_account || '',
                website: company.website || '',
            });
        }
    }, [company, form]);

    const onSubmit = async (values: CompanyFormValues) => {
        try {
            if (isNew) {
                await createCompany.mutateAsync(values);
                toast.success('Company created successfully');
                navigate('/companies');
            } else {
                if (!id) return;
                await updateCompany.mutateAsync({ id, ...values });
                toast.success('Company updated successfully');
                navigate('/companies');
            }
        } catch (error) {
            console.error('Failed to save company', error);
            toast.error('Failed to save company');
        }
    };

    const handleConnectStripe = async () => {
        try {
            if (!company?.id) return;
            const response = await api.get(`/api/stripe/connect?companyId=${company.id}`, {
                headers: {
                    'X-User-Id': user?.sub
                }
            });
            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Failed to initiate Stripe Connect', error);
            toast.error('Failed to initiate Stripe connection');
        }
    };

    if (!isNew && isLoadingCompany) {
        return <div className="p-8">Loading company details...</div>;
    }

    return (
        <div className="container max-w-3xl py-10">
            <Card>
                <CardHeader>
                    <CardTitle>{isNew ? 'Create New Company' : 'Edit Company'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Business Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Acme Corp" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="abn"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ABN</FormLabel>
                                            <FormControl>
                                                <Input placeholder="00 000 000 000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="contact@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="0400 000 000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Website</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="md:col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="123 Main St" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {!isNew && id && (
                                <>
                                    <Separator className="my-6" />
                                    <h3 className="text-lg font-medium mb-4">Company Logo</h3>
                                    <FileUpload
                                        uploadUrl={`/api/companies/${id}/logo`}
                                        downloadUrl={`/api/companies/${id}/logo?t=${Date.now()}`}
                                        deleteUrl={`/api/companies/${id}/logo`}
                                        accept="image/*"
                                        maxSizeMB={5}
                                        showPreview={true}
                                        showDelete={true}
                                        uploadLabel="Upload Logo"
                                        onUploadSuccess={() => {
                                            toast.success('Company logo updated!');
                                        }}
                                        onDeleteSuccess={() => {
                                            toast.success('Company logo deleted!');
                                        }}
                                    />
                                </>
                            )}

                            <Separator className="my-6" />
                            <div>
                                <h3 className="text-lg font-medium">Banking Details</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Display your bank details on invoices for customers who prefer to pay via bank transfer.{' '}
                                    <Link to="/settings/template-config" className="text-primary hover:underline">
                                        Customize payment instructions
                                    </Link> in your PDF template settings.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="bank_bsb"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>BSB</FormLabel>
                                            <FormControl>
                                                <Input placeholder="000-000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bank_account"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Account Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="00000000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {!isNew && id && (
                                <>
                                    <Separator className="my-6" />
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                                Payment Integrations
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Enable payment processing to get paid faster
                                            </p>
                                        </div>
                                        <div className="border-2 border-purple-200 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 dark:border-purple-800">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M2 5C2 3.89543 2.89543 3 4 3H20C21.1046 3 22 3.89543 22 5V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19V5ZM4 7V9H20V7H4ZM4 11V19H20V11H4Z" />
                                                        </svg>
                                                        <h4 className="font-bold text-lg text-purple-900 dark:text-purple-100">Stripe Connect</h4>
                                                    </div>
                                                    <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">
                                                        Accept payments on invoices. Funds are deposited directly to your bank account.
                                                    </p>
                                                </div>
                                                <div className="ml-4">
                                                    {company?.stripeConnectedAccountId ? (
                                                        <div className="flex flex-col items-end gap-2">
                                                            <div className="flex items-center gap-2 text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-100 px-4 py-2 rounded-full border-2 border-green-300 dark:border-green-700">
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                                <span className="font-bold">Connected</span>
                                                            </div>
                                                            <a
                                                                href="https://dashboard.stripe.com/connect/accounts/overview"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 hover:underline flex items-center gap-1"
                                                            >
                                                                Manage in Stripe Dashboard
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                </svg>
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            onClick={handleConnectStripe}
                                                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-6 py-2 shadow-lg"
                                                        >
                                                            Setup Payouts
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => navigate('/companies')}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createCompany.isPending || updateCompany.isPending}>
                                    {isNew ? 'Create Company' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div >
    );
}
