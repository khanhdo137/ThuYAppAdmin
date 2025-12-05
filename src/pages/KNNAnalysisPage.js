import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  Autocomplete,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  Psychology as PsychologyIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import PageTemplate from '../components/PageTemplate';
import { useToast } from '../components/ToastProvider';
import knnAnalysisService from '../services/knnAnalysisService';

const KNNAnalysisPage = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [kValue, setKValue] = useState(5);
  const { showError, showSuccess, showWarning } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const data = await knnAnalysisService.getCustomersForAnalysis();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      showError('Lỗi khi tải danh sách khách hàng');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedCustomer) {
      showWarning('Vui lòng chọn khách hàng');
      return;
    }

    try {
      setLoading(true);
      const result = await knnAnalysisService.analyzeCustomer(selectedCustomer.customerId, kValue);
      console.log('=== KNN Analysis Result ===');
      console.log('Recommendations:', result.recommendations);
      if (result.recommendations && result.recommendations.length > 0) {
        console.log('First recommendation:', result.recommendations[0]);
        console.log('RecommendedByDetails:', result.recommendations[0].recommendedByDetails);
      }
      setAnalysisResult(result);
      showSuccess('Phân tích thành công!');
    } catch (error) {
      console.error('Error analyzing customer:', error);
      showError('Lỗi khi phân tích: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const renderCustomerInfo = () => {
    if (!analysisResult) return null;

    const { targetCustomer } = analysisResult;

    return (
      <Card elevation={3}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <PersonIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h5" component="div">
              Thông tin khách hàng
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Tên khách hàng</Typography>
              <Typography variant="h6">{targetCustomer.customerName}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body1">{targetCustomer.email || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
              <Typography variant="body1">{targetCustomer.phoneNumber || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Tổng lịch hẹn hoàn thành</Typography>
              <Typography variant="h6" color="primary">{targetCustomer.completedAppointments}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Số dịch vụ đã dùng</Typography>
              <Typography variant="h6" color="secondary">{targetCustomer.uniqueServices}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>Lịch sử sử dụng dịch vụ</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Dịch vụ</strong></TableCell>
                  <TableCell align="center"><strong>Số lần</strong></TableCell>
                  <TableCell><strong>Lần cuối</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {targetCustomer.serviceHistory.map((service) => (
                  <TableRow key={service.serviceId}>
                    <TableCell>{service.serviceName}</TableCell>
                    <TableCell align="center">
                      <Chip label={service.usageCount} color="primary" size="small" />
                    </TableCell>
                    <TableCell>
                      {service.lastUsedDate 
                        ? new Date(service.lastUsedDate).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                Service Vector (Chi tiết ma trận)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {targetCustomer.serviceVector.map((item) => (
                  <Chip
                    key={item.serviceId}
                    label={`${item.serviceName}: ${item.count}`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    );
  };

  const renderSimilarCustomers = () => {
    if (!analysisResult || !analysisResult.similarCustomers.length) return null;

    return (
      <Card elevation={3}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <TrendingUpIcon color="secondary" sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h5" component="div">
              Top {analysisResult.k} khách hàng tương đồng
            </Typography>
            <Tooltip title="Khách hàng có hành vi sử dụng dịch vụ tương tự" placement="top">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography variant="body2" color="text.secondary" mb={2}>
            Tổng số khách hàng được phân tích: {analysisResult.totalCustomersAnalyzed}
          </Typography>

          {analysisResult.similarCustomers.map((customer, index) => (
            <Accordion key={customer.customerId} defaultExpanded={index === 0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" width="100%">
                  <Chip 
                    label={`#${index + 1}`} 
                    color="primary" 
                    size="small" 
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {customer.customerName}
                  </Typography>
                  <Box textAlign="right" mr={2}>
                    <Typography variant="body2" color="text.secondary">
                      Similarity Score
                    </Typography>
                    <Typography variant="h6" color="secondary">
                      {(customer.similarityScore * 100).toFixed(2)}%
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <LinearProgress 
                      variant="determinate" 
                      value={customer.similarityScore * 100} 
                      sx={{ height: 8, borderRadius: 1, mb: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Dịch vụ chung
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {customer.commonServices.length > 0 ? (
                        customer.commonServices.map((service, idx) => (
                          <Chip 
                            key={idx} 
                            label={service} 
                            size="small" 
                            color="success"
                            variant="outlined"
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Không có dịch vụ chung
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Service Vector của khách hàng này
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {customer.serviceVector.map((item) => (
                        <Chip
                          key={item.serviceId}
                          label={`${item.serviceName}: ${item.count}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="info" variant="outlined">
                      <strong>Tổng dịch vụ đã sử dụng:</strong> {customer.totalServices} dịch vụ
                    </Alert>
                  </Grid>

                  {/* Chi tiết công thức tính Cosine Similarity */}
                  <Grid item xs={12}>
                    <Accordion sx={{ bgcolor: 'grey.50' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center">
                          <InfoIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1">
                            Chi tiết tính toán Cosine Similarity
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {(() => {
                          // Tạo map của tất cả services
                          const allServiceIds = new Set([
                            ...analysisResult.targetCustomer.serviceVector.map(s => s.serviceId),
                            ...customer.serviceVector.map(s => s.serviceId)
                          ]);

                          // Tạo vector đầy đủ
                          const targetMap = {};
                          analysisResult.targetCustomer.serviceVector.forEach(s => {
                            targetMap[s.serviceId] = s.count;
                          });

                          const customerMap = {};
                          customer.serviceVector.forEach(s => {
                            customerMap[s.serviceId] = s.count;
                          });

                          const vectorA = Array.from(allServiceIds).map(id => targetMap[id] || 0);
                          const vectorB = Array.from(allServiceIds).map(id => customerMap[id] || 0);

                          // Tính toán
                          const dotProduct = vectorA.reduce((sum, a, i) => sum + (a * vectorB[i]), 0);
                          const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + (a * a), 0));
                          const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + (b * b), 0));
                          const similarity = dotProduct / (magnitudeA * magnitudeB);

                          return (
                            <Box>
                              <Typography variant="body2" paragraph>
                                <strong>Công thức:</strong>
                              </Typography>
                              <Paper elevation={0} sx={{ p: 2, bgcolor: 'info.light', mb: 2, fontFamily: 'monospace', color: 'info.contrastText' }}>
                                similarity = (A · B) / (||A|| × ||B||)
                              </Paper>

                              <Typography variant="body2" paragraph>
                                <strong>Vector {analysisResult.targetCustomer.customerName}</strong> (khách hàng đang phân tích):
                              </Typography>
                              <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                                {analysisResult.targetCustomer.serviceVector.map((item) => (
                                  <Chip
                                    key={item.serviceId}
                                    label={`${item.serviceName}: ${item.count}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                              <Paper elevation={0} sx={{ p: 1, bgcolor: 'primary.light', mb: 2, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                [{vectorA.join(', ')}]
                              </Paper>

                              <Typography variant="body2" paragraph>
                                <strong>Vector {customer.customerName}:</strong>
                              </Typography>
                              <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                                {customer.serviceVector.map((item) => (
                                  <Chip
                                    key={item.serviceId}
                                    label={`${item.serviceName}: ${item.count}`}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                              <Paper elevation={0} sx={{ p: 1, bgcolor: 'secondary.light', mb: 2, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                [{vectorB.join(', ')}]
                              </Paper>

                              <Divider sx={{ my: 2 }} />

                              <Typography variant="body2" paragraph>
                                <strong>Các bước tính toán:</strong>
                              </Typography>
                              
                              <List dense>
                                <ListItem>
                                  <ListItemText 
                                    primary={`1. Tích vô hướng (Dot Product)`}
                                    secondary={
                                      <Box component="span">
                                        <Box component="div" sx={{ fontFamily: 'monospace', my: 0.5 }}>
                                          {vectorA.map((a, i) => `(${a} × ${vectorB[i]})`).join(' + ')}
                                        </Box>
                                        <Box component="div" sx={{ fontFamily: 'monospace', my: 0.5 }}>
                                          = {vectorA.map((a, i) => a * vectorB[i]).join(' + ')}
                                        </Box>
                                        <Box component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                          = {dotProduct.toFixed(2)}
                                        </Box>
                                      </Box>
                                    }
                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                  />
                                </ListItem>
                                <ListItem>
                                  <ListItemText 
                                    primary={`2. Độ lớn vector ${analysisResult.targetCustomer.customerName}`}
                                    secondary={
                                      <Box component="span">
                                        <Box component="div" sx={{ fontFamily: 'monospace', my: 0.5 }}>
                                          √({vectorA.map(a => `${a}²`).join(' + ')})
                                        </Box>
                                        <Box component="div" sx={{ fontFamily: 'monospace', my: 0.5 }}>
                                          = √({vectorA.map(a => a * a).join(' + ')})
                                        </Box>
                                        <Box component="div" sx={{ fontFamily: 'monospace', my: 0.5 }}>
                                          = √{vectorA.reduce((sum, a) => sum + (a * a), 0)}
                                        </Box>
                                        <Box component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                          = {magnitudeA.toFixed(2)}
                                        </Box>
                                      </Box>
                                    }
                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                  />
                                </ListItem>
                                <ListItem>
                                  <ListItemText 
                                    primary={`3. Độ lớn vector ${customer.customerName}`}
                                    secondary={
                                      <Box component="span">
                                        <Box component="div" sx={{ fontFamily: 'monospace', my: 0.5 }}>
                                          √({vectorB.map(b => `${b}²`).join(' + ')})
                                        </Box>
                                        <Box component="div" sx={{ fontFamily: 'monospace', my: 0.5 }}>
                                          = √({vectorB.map(b => b * b).join(' + ')})
                                        </Box>
                                        <Box component="div" sx={{ fontFamily: 'monospace', my: 0.5 }}>
                                          = √{vectorB.reduce((sum, b) => sum + (b * b), 0)}
                                        </Box>
                                        <Box component="div" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                                          = {magnitudeB.toFixed(2)}
                                        </Box>
                                      </Box>
                                    }
                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                  />
                                </ListItem>
                                <ListItem>
                                  <ListItemText 
                                    primary="4. Chia tích vô hướng cho tích hai độ lớn"
                                    secondary={
                                      <Box component="span">
                                        <Box component="div" sx={{ fontFamily: 'monospace', my: 0.5 }}>
                                          {dotProduct.toFixed(2)} / ({magnitudeA.toFixed(2)} × {magnitudeB.toFixed(2)})
                                        </Box>
                                        <Box component="div" sx={{ fontFamily: 'monospace', my: 0.5 }}>
                                          = {dotProduct.toFixed(2)} / {(magnitudeA * magnitudeB).toFixed(2)}
                                        </Box>
                                        <Box component="div" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '1.1rem' }}>
                                          = {similarity.toFixed(4)} ({(similarity * 100).toFixed(2)}%)
                                        </Box>
                                      </Box>
                                    }
                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                  />
                                </ListItem>
                              </List>

                              <Alert severity="success" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                  <strong>Ý nghĩa:</strong> Giá trị từ 0 đến 1 (0-100%). 
                                  Với similarity score <strong>{(customer.similarityScore * 100).toFixed(2)}%</strong>, 
                                  hành vi sử dụng dịch vụ của {customer.customerName} và {analysisResult.targetCustomer.customerName} có độ tương đồng cao.
                                </Typography>
                              </Alert>
                            </Box>
                          );
                        })()}
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderRecommendations = () => {
    if (!analysisResult || !analysisResult.recommendations.length) {
      return (
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <LightbulbIcon color="warning" sx={{ mr: 1, fontSize: 32 }} />
              <Typography variant="h5" component="div">
                Gợi ý dịch vụ
              </Typography>
            </Box>
            <Alert severity="info">
              Không có gợi ý dịch vụ mới (khách hàng đã sử dụng tất cả dịch vụ của các khách hàng tương đồng)
            </Alert>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card elevation={3}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <LightbulbIcon color="warning" sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h5" component="div">
              Gợi ý dịch vụ từ KNN
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" mb={2}>
            Các dịch vụ được gợi ý dựa trên hành vi của {analysisResult.k} khách hàng tương đồng nhất
          </Typography>

          <List>
            {analysisResult.recommendations.map((rec, index) => (
              <React.Fragment key={rec.serviceId}>
                <ListItem
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: index < 3 ? 'action.hover' : 'background.paper'
                  }}
                >
                  <Box width="100%">
                    <Box display="flex" alignItems="center" mb={1}>
                      <Chip 
                        label={`Top ${index + 1}`} 
                        color={index < 3 ? 'warning' : 'default'}
                        size="small" 
                        sx={{ mr: 2 }}
                      />
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {rec.serviceName}
                      </Typography>
                      <Box textAlign="right">
                        <Typography variant="body2" color="text.secondary">
                          Score
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {rec.recommendationScore.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>

                    {rec.serviceDescription && (
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {rec.serviceDescription}
                      </Typography>
                    )}

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="body2" gutterBottom>
                      <strong>Lý do:</strong> {rec.reason}
                    </Typography>

                    <Accordion sx={{ mt: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2">
                          Được gợi ý bởi {rec.recommendedByCount} khách hàng tương đồng
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {rec.recommendedBy.map((by, idx) => (
                            <ListItem key={idx}>
                              <ListItemText 
                                primary={by}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>

                    {/* Chi tiết tính toán Score */}
                    <Accordion sx={{ mt: 1, bgcolor: 'warning.light' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center">
                          <InfoIcon color="warning" sx={{ mr: 1 }} />
                          <Typography variant="body2" fontWeight="medium">
                            Chi tiết tính toán Score: {rec.recommendationScore.toFixed(2)}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box>
                          <Typography variant="body2" paragraph>
                            <strong>Công thức tính Score:</strong>
                          </Typography>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'info.light', mb: 2, fontFamily: 'monospace', color: 'info.contrastText' }}>
                            Score = Σ (Similarity × UsageCount)
                          </Paper>

                          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                            Score được tính bằng tổng của (độ tương đồng × số lần sử dụng dịch vụ) từ tất cả khách hàng tương đồng đã dùng dịch vụ này.
                          </Typography>

                          <Typography variant="body2" paragraph>
                            <strong>Tính toán chi tiết:</strong>
                          </Typography>

                          {(() => {
                            // Tính toán lại để đảm bảo chính xác
                            let calculatedTotal = 0;
                            
                            // Dùng recommendedByDetails từ backend (có đủ thông tin)
                            const calculations = (rec.recommendedByDetails || []).map((detail) => {
                              const componentScore = detail.similarityScore * detail.usageCount;
                              calculatedTotal += componentScore;

                              return {
                                customerName: detail.customerName,
                                similarity: detail.similarityScore,
                                usageCount: detail.usageCount,
                                componentScore
                              };
                            });

                            return (
                              <>
                                <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell><strong>Khách hàng</strong></TableCell>
                                        <TableCell align="right"><strong>Similarity</strong></TableCell>
                                        <TableCell align="right"><strong>Số lần dùng</strong></TableCell>
                                        <TableCell align="right"><strong>Điểm thành phần</strong></TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {calculations.map((calc, idx) => (
                                        <TableRow key={idx}>
                                          <TableCell>{calc.customerName}</TableCell>
                                          <TableCell align="right">
                                            <Chip 
                                              label={`${(calc.similarity * 100).toFixed(2)}%`} 
                                              size="small" 
                                              color="primary"
                                              variant="outlined"
                                            />
                                          </TableCell>
                                          <TableCell align="right">
                                            <Chip 
                                              label={calc.usageCount} 
                                              size="small" 
                                              color="secondary"
                                            />
                                          </TableCell>
                                          <TableCell align="right">
                                            <Typography variant="body2" fontFamily="monospace">
                                              {calc.similarity.toFixed(3)} × {calc.usageCount} = <strong>{calc.componentScore.toFixed(3)}</strong>
                                            </Typography>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                      <TableRow sx={{ bgcolor: 'success.light' }}>
                                        <TableCell colSpan={3}>
                                          <Typography variant="body2" fontWeight="bold">
                                            TỔNG SCORE (Tính lại)
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                          <Typography variant="h6" color="success.dark" fontWeight="bold">
                                            {calculatedTotal.toFixed(2)}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                      <TableRow sx={{ bgcolor: 'info.light' }}>
                                        <TableCell colSpan={3}>
                                          <Typography variant="body2" fontWeight="bold">
                                            Score từ Backend
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                          <Typography variant="h6" color="info.dark" fontWeight="bold">
                                            {rec.recommendationScore.toFixed(2)}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </>
                            );
                          })()}

                          <Alert severity="info">
                            <Typography variant="body2">
                              <strong>Ý nghĩa:</strong> Score cao hơn = Dịch vụ được nhiều khách hàng tương đồng sử dụng thường xuyên hơn. 
                              Dịch vụ này xếp hạng <strong>Top {index + 1}</strong> trong {analysisResult.recommendations.length} gợi ý.
                            </Typography>
                          </Alert>

                          <Divider sx={{ my: 2 }} />

                          <Typography variant="caption" color="text.secondary">
                            <strong>Ví dụ:</strong> Nếu khách hàng A (similarity 0.894) dùng dịch vụ này 3 lần, 
                            điểm thành phần = 0.894 × 3 = 2.682. Tổng điểm = tổng của tất cả điểm thành phần.
                          </Typography>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  };

  const renderCalculationDetails = () => {
    if (!analysisResult) return null;

    const { calculationDetails } = analysisResult;

    return (
      <Card elevation={3}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <PsychologyIcon color="info" sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h5" component="div">
              Chi tiết thuật toán
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert severity="info" variant="outlined">
                <Typography variant="body2">
                  <strong>Mô tả:</strong> {calculationDetails.algorithmDescription}
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="body2">Kích thước vector</Typography>
                <Typography variant="h4">{calculationDetails.vectorSize}</Typography>
                <Typography variant="caption">dịch vụ</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                <Typography variant="body2">K-value</Typography>
                <Typography variant="h4">{analysisResult.k}</Typography>
                <Typography variant="caption">khách hàng gần nhất</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                <Typography variant="body2">Similarity Threshold</Typography>
                <Typography variant="h4">{calculationDetails.cosineSimilarityThreshold}</Typography>
                <Typography variant="caption">minimum score</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    Công thức Cosine Similarity
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body2" paragraph>
                      Cosine Similarity được tính bằng công thức:
                    </Typography>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.100', fontFamily: 'monospace' }}>
                      similarity = (A · B) / (||A|| × ||B||)
                    </Paper>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Trong đó:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="A · B: Tích vô hướng (dot product) của 2 vector"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="||A||, ||B||: Độ lớn (magnitude) của mỗi vector"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Kết quả: Giá trị từ 0 đến 1, càng gần 1 càng tương đồng"
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    </List>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageTemplate
      title="Phân tích KNN - Recommendation System"
      icon={<AnalyticsIcon />}
    >
      <Box sx={{ p: 3 }}>
        {/* Control Panel */}
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={customers}
                  getOptionLabel={(option) => 
                    `${option.customerName} - ${option.totalCompletedAppointments} lịch hẹn`
                  }
                  value={selectedCustomer}
                  onChange={(event, newValue) => setSelectedCustomer(newValue)}
                  loading={loadingCustomers}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Chọn khách hàng"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingCustomers ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body1">{option.customerName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.totalCompletedAppointments} lịch hẹn • 
                          Lần cuối: {option.lastAppointmentDate 
                            ? new Date(option.lastAppointmentDate).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  label="K-value (số khách hàng tương đồng)"
                  type="number"
                  value={kValue}
                  onChange={(e) => setKValue(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
                  InputProps={{ inputProps: { min: 1, max: 20 } }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleAnalyze}
                  disabled={!selectedCustomer || loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <PsychologyIcon />}
                >
                  {loading ? 'Đang phân tích...' : 'Phân tích'}
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info" variant="outlined">
                  <Typography variant="body2">
                    <strong>Hướng dẫn:</strong> Chọn một khách hàng và thiết lập K-value (số lượng khách hàng tương đồng cần tìm), 
                    sau đó nhấn "Phân tích" để xem cách thuật toán KNN đưa ra gợi ý dịch vụ dựa trên hành vi của các khách hàng tương tự.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Results */}
        {loading && (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress size={60} />
          </Box>
        )}

        {!loading && analysisResult && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {renderCustomerInfo()}
            </Grid>

            <Grid item xs={12}>
              {renderSimilarCustomers()}
            </Grid>

            <Grid item xs={12}>
              {renderRecommendations()}
            </Grid>

            <Grid item xs={12}>
              {renderCalculationDetails()}
            </Grid>
          </Grid>
        )}

        {!loading && !analysisResult && (
          <Box textAlign="center" py={5}>
            <PsychologyIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Chọn khách hàng và nhấn "Phân tích" để bắt đầu
            </Typography>
          </Box>
        )}
      </Box>
    </PageTemplate>
  );
};

export default KNNAnalysisPage;
