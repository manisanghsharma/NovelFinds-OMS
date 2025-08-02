import { useState, useEffect } from 'react';
import { X, ShoppingBag, Package, Calendar, User, Phone, MapPin, CreditCard, Clipboard, ArrowUpRight, MessageSquare, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { orderApi } from '../../services/api';

const ViewOrderModal = ({ isOpen, onClose, order: initialOrder }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState('');
  const [enlargedImage, setEnlargedImage] = useState(false);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(type);
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const copyTrackingMessage = (trackingId) => {
    const message = `Good afternoon!\nWe have shipped your order. You can track it using the consignment number - ${trackingId} on the India Post website.`;
    copyToClipboard(message, 'message');
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (isOpen && initialOrder?._id) {
        setLoading(true);
        try {
          // Fetch complete order data with populated fields
          const completeOrder = await orderApi.getOrderById(initialOrder._id);
          setOrder(completeOrder);
        } catch (error) {
          console.error('Error fetching order details:', error);
          // Fall back to the initial order data if the API call fails
          setOrder(initialOrder);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrderDetails();
  }, [isOpen, initialOrder]);
  
  if (loading) {
    return isOpen ? (
      <div className='fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50'>
        <div className='bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-3 flex justify-center items-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700'></div>
        </div>
      </div>
    ) : null;
  }
  
  if (!isOpen || !initialOrder) return null;
  
  // Use the fetched order data, or fall back to initialOrder if needed
  const orderData = order || initialOrder;
  
  // Calculate total expense accounting for quantities
  const totalBookCost = orderData.books?.reduce((sum, book) => {
    const quantity = book.quantity || 1;
    return sum + (parseFloat(book.purchaseCost) || 0) * quantity;
  }, 0) || 0;
  const shippingCost = orderData.shippingCost || 0;
  const totalExpense = totalBookCost + shippingCost;
  const netProfit = (orderData.amountReceived || 0) - totalExpense;
  
  return (
		<div className='fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-1'>
			<div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-3'>
				<div className='flex justify-between items-center border-b px-4 py-3 md:px-6 md:py-4 sticky top-0 bg-white z-10'>
					<h2 className='text-lg md:text-xl font-semibold text-gray-800'>Order Details</h2>
					<button
						onClick={() => onClose()}
						className='text-gray-400 hover:text-gray-600 cursor-pointer p-1'
					>
						<X size={18} />
					</button>
				</div>

				<div className='p-4 md:p-6 space-y-4 md:space-y-6'>
					{/* Order Header */}
					<div className='flex flex-col md:flex-row justify-between border-b pb-3 md:pb-4'>
						<div>
							<div className='flex items-center space-x-2'>
								<Calendar size={16} className='text-indigo-600' />
								<span className='text-xs md:text-sm text-gray-500'>Order Date:</span>
								<span className='text-sm md:text-base font-medium'>
									{new Date(orderData.orderDate).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</span>
							</div>
							{orderData._id && (
								<div className='mt-1 text-xs md:text-sm text-gray-500'>
									Order ID: #{orderData._id.slice(-6).toUpperCase()}
								</div>
							)}
						</div>
						<div className="mt-2 md:mt-0">
							<span
								className={`px-2 py-0.5 md:px-3 md:py-1 inline-flex text-xs md:text-sm leading-5 font-semibold rounded-full 
                ${
									orderData.status === "Delivered"
										? "bg-green-100 text-green-800"
										: orderData.status === "Shipped"
										? "bg-blue-100 text-blue-800"
										: orderData.status === "Packed"
										? "bg-yellow-100 text-yellow-800"
										: "bg-gray-100 text-gray-800"
								}`}
							>
								{orderData.status}
							</span>
						</div>
					</div>

					{/* Customer Information */}
					<div className='space-y-3 md:space-y-4'>
						<h3 className='text-base md:text-lg font-medium border-b pb-2'>
							Customer Information
						</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
							<div className='space-y-2'>
								<div className='flex items-start space-x-2'>
									<User size={16} className='text-indigo-600 mt-0.5' />
									<div>
										<div className='text-sm md:text-base font-medium'>
											{orderData.customer?.name || "N/A"}
										</div>
										<div className='text-xs md:text-sm text-gray-500'>
											{orderData.customer?.socialHandle || "N/A"}
										</div>
									</div>
								</div>
								<div className='flex items-start space-x-2'>
									<Phone size={16} className='text-indigo-600 mt-0.5' />
									<div>
										<div className='text-sm md:text-base font-medium'>
											{orderData.customer?.phoneNumber || "N/A"}
										</div>
										{orderData.customer?.otherPhone && (
											<div className='text-xs md:text-sm text-gray-500'>
												{orderData.customer.otherPhone}
											</div>
										)}
									</div>
								</div>
							</div>
							<div className='flex items-start space-x-2'>
								<MapPin size={16} className='text-indigo-600 mt-0.5' />
								<div>
									{orderData.shippingAddress?.address ? (
										<>
											<div className='text-sm md:text-base font-medium whitespace-pre-line'>
												{orderData.shippingAddress.address}
											</div>
										</>
									) : (
										<div className='text-sm md:text-base font-medium whitespace-pre-line'>
											{orderData.customer?.address || "No address provided"}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Order Items */}
					<div className='space-y-3 md:space-y-4'>
						<h3 className='text-base md:text-lg font-medium border-b pb-2'>Order Items</h3>
						<div className='overflow-x-auto -mx-4 md:mx-0'>
							<table className='min-w-full divide-y divide-gray-200'>
								<thead className='bg-gray-50'>
									<tr>
										<th className='px-3 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Book
										</th>
										<th className='px-3 py-2 md:px-4 md:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Quantity
										</th>
										<th className='px-3 py-2 md:px-4 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Cost
										</th>
										<th className='px-3 py-2 md:px-4 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Weight
										</th>
									</tr>
								</thead>
								<tbody className='bg-white divide-y divide-gray-200'>
									{orderData.books?.map((book, index) => (
										<tr key={book._id || index}>
											<td className='px-3 py-2 md:px-4 md:py-3 whitespace-nowrap'>
												<div className='flex items-start space-x-2'>
													<ShoppingBag
														size={14}
														className='text-indigo-600 mt-1'
													/>
													<div>
														<div className='text-xs md:text-sm font-medium text-gray-900'>
															{book.title || "Untitled"}
														</div>
														<div className='text-xs text-gray-500'>
															{book.author || "Unknown author"}
														</div>
													</div>
												</div>
											</td>
											<td className='px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900'>
												{book.quantity || 1}
											</td>
											<td className='px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-right text-gray-900'>
												₹
												{book.purchaseCost !== undefined
													? (book.purchaseCost * (book.quantity || 1)).toFixed(2)
													: "0"}
											</td>
											<td className='px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-right text-gray-500'>
												{book.weight !== undefined
													? `${(book.weight * (book.quantity || 1)).toFixed(2)} kg`
													: "N/A"}
											</td>
										</tr>
									))}
								</tbody>
								<tfoot className='bg-gray-50'>
									<tr>
										<td className='px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium'>
											Total ({orderData.books?.length || 0}{" "}
											{orderData.books?.length === 1 ? "book" : "books"})
										</td>
										<td className='px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center font-medium'>
											{orderData.books?.reduce((sum, book) => sum + (book.quantity || 1), 0) || 0}
										</td>
										<td className='px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-right font-medium'>
											₹{totalBookCost.toFixed(2)}
										</td>
										<td className='px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-right'>
											{orderData.books
												?.reduce((sum, book) => {
													const weight = parseFloat(book.weight || 0);
													return isNaN(weight) ? sum : sum + (weight * (book.quantity || 1));
												}, 0)
												.toFixed(2)}{" "}
											kg
										</td>
									</tr>
								</tfoot>
							</table>
						</div>
					</div>

					{/* Tracking Information (if available) */}
					{orderData.trackingId && (
						<div className='space-y-3 md:space-y-4'>
							<h3 className='text-base md:text-lg font-medium border-b pb-2'>
								Tracking Information
							</h3>
							<div className='bg-gray-50 p-3 md:p-4 rounded-md'>
								<div className='flex items-start flex-wrap gap-2'>
									<div className='flex items-center space-x-2 mb-2 flex-grow'>
										<Package size={16} className='text-indigo-600' />
										<span className='text-sm md:text-base font-medium'>Tracking ID:</span>
										<button 
											onClick={() => copyToClipboard(orderData.trackingId, 'tracking')}
											className='text-sm md:text-base cursor-pointer text-indigo-600 border-b border-dotted border-indigo-600 hover:text-indigo-800 focus:outline-none'
										>
											{orderData.trackingId}
										</button>
										{copyStatus === 'tracking' && (
											<span className='text-xs text-green-600 ml-1'>Copied!</span>
										)}
									</div>
									<div className='flex flex-wrap gap-2'>
										<a 
											href="https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx"
											target="_blank"
											rel="noopener noreferrer"
											className='flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs md:text-sm hover:bg-blue-200 transition-colors'
										>
											Track <ArrowUpRight size={14} className="ml-1" />
										</a>
										{orderData.trackingImage && (
											<button
												onClick={() => setEnlargedImage(true)}
												className='flex items-center cursor-pointer px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs md:text-sm hover:bg-purple-200 transition-colors'
												title='View Shipping Image'
											>
												<ImageIcon size={14} className="mr-1" />
												Image
											</button>
										)}
										<button 
											onClick={() => copyTrackingMessage(orderData.trackingId)}
											className='flex items-center cursor-pointer px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs md:text-sm hover:bg-green-200 transition-colors'
										>
											DM <MessageSquare size={14} className="ml-1" />
											{copyStatus === 'message' && (
												<span className='ml-1'>✓</span>
											)}
										</button>
									</div>
								</div>
								
								{orderData.trackingImage && (
									null
								)}
							</div>
						</div>
					)}

					{/* Financial Summary */}
					<div className='space-y-3 md:space-y-4'>
						<h3 className='text-base md:text-lg font-medium border-b pb-2'>Order Summary</h3>
						<div className='bg-gray-50 p-3 md:p-4 rounded-md space-y-1 md:space-y-2 text-sm md:text-base'>
							<div className='flex justify-between'>
								<span className='text-gray-700'>Books Cost:</span>
								<span className='font-medium'>₹{totalBookCost.toFixed(2)}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-700'>Shipping Cost:</span>
								<span className='font-medium'>₹{shippingCost}</span>
							</div>
							<div className='flex justify-between border-t border-gray-200 pt-1 md:pt-2'>
								<span className='text-gray-700'>Total Expense:</span>
								<span className='font-medium'>₹{totalExpense.toFixed(2)}</span>
							</div>
							<div className='flex justify-between items-center pt-1'>
								<div className='flex items-center text-gray-700'>
									<CreditCard size={14} className='mr-1' />
									<span>Amount Received:</span>
								</div>
								<span className='font-medium'>
									₹{orderData.amountReceived || 0}
								</span>
							</div>
							<div className='flex justify-between border-t border-gray-200 pt-1 md:pt-2'>
								<span className='font-medium'>Net Profit:</span>
								<span
									className={`font-bold ${
										netProfit >= 0 ? "text-green-600" : "text-red-600"
									}`}
								>
									₹{netProfit.toFixed(2)}
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className='border-t px-4 py-3 md:px-6 md:py-4 flex justify-end'>
					<button
						onClick={() => onClose()}
						className='px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors cursor-pointer'
					>
						Close
					</button>
				</div>
			</div>
			
			{/* Enlarged Image Modal */}
			{enlargedImage && orderData.trackingImage && (
				<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
					<div className="relative max-w-3xl w-full">
						<button 
							onClick={() => setEnlargedImage(false)}
							className="absolute -top-10 right-0 text-white hover:text-gray-300 p-2"
							aria-label="Close"
						>
							<X size={24} />
						</button>
						<img 
							src={orderData.trackingImage} 
							alt="Tracking Slip" 
							className="max-w-full max-h-[80vh] object-contain mx-auto"
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default ViewOrderModal; 