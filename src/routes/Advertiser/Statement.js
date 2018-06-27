import React, { Component ,Fragment} from 'react';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Card,Form,Row, Col, Input, Button,AutoComplete,DatePicker,Radio,Select ,Table,Alert,Badge } from 'antd';
import commonStyle from './Report.less';
import InvoiceModal from './GenerateInvoiceModal';
import { connect } from 'dva';
import moment from 'moment';
import {deepCloneObj} from '../../utils/commonFunc';
const FormItem = Form.Item;
const { MonthPicker } = DatePicker;
const RadioGroup = Radio.Group;
const Option = Select.Option;

@Form.create()
@connect(({ advReport,advStatement,loading }) => ({
    advReport,
    advStatement,
    loading: loading.effects['advStatement/fetch'],  
}))
export default class AdvStatement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [],
            selectedRows:[],
            totalInvoiceAmount:[],
            invoiceModalvisible:false,
            showGenerateInvoiveOption:false,
            showApproveOrRejectOption:false,
            tableQuery:{
                advAccountId:null,
                employeeId:null,
                month:'',
                keyWords:''
            },
            advAccountValue:'',
            employeeValue:'',
            employeeRole:"1",
            pageCurrent:1,
            pageSize:20,
            invoiceAmount:[],
            cellCurrency:[],
            cellApprove:[]
        };
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'advStatement/fetch',
            payload:{
                ...this.state.tableQuery,
                pageCurrent:this.state.pageCurrent,
                pageSize:this.state.pageSize
            }
        })
    }

    componentWillUnmount() {
        this.props.dispatch({
            type:'advStatement/clear'
        })
    }

    submitSearch = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                let data = Object.assign({}, this.state.tableQuery, {keyWords:values.keyWords});
                this.setState({
                    tableQuery: data,
                    pageCurrent:1
                },function(){
                    this.props.dispatch({
                        type:'advStatement/fetch',
                        payload:{
                            ...this.state.tableQuery,
                            pageCurrent:this.state.pageCurrent,
                            pageSize:this.state.pageSize
                        }
                    });
                });
            }
        });
    }

    dateRangeChange = (date, dateString) => {
        this.tableQueryReplace({month:dateString});
    }

    //批量选择操作 1--Approved 2--Rejected 3--Invoiced
    selectOption = (value) => {
        console.log(`selected ${value}`);
        if(value == 3){
            this.setState({ invoiceModalvisible: true });
        }
    }

    selectTableRow =  (selectedRowKeys, selectedRows) => {
        this.setState({
            showGenerateInvoiveOption:false,
            showApproveOrRejectOption:false
        });
        let totalInvoiceAmount = [];
        let rowStatus = [];
        selectedRows.map((item) => {
            rowStatus.push(item.finApproStatus);
            if(item.currency == "USD"){
                if(totalInvoiceAmount.length){
                    totalInvoiceAmount.forEach((item1,index)=>{
                        if(item1.type == 'USD'){
                            item1.total += Number(item.invoiceAmount) 
                        }
                    })
                }else{
                    totalInvoiceAmount.push({'type':item.currency,"total":Number(item.invoiceAmount)})
                }
            }else if(item.currency == "INR"){
                if(totalInvoiceAmount.length){
                    totalInvoiceAmount.forEach((item1,index)=>{
                        if(item1.type == 'INR'){
                            item1.total += Number(item.invoiceAmount) 
                        }
                    })
                }else{
                    totalInvoiceAmount.push({'type':item.currency,"total":Number(item.invoiceAmount)})
                }
            }
        });
        if(rowStatus.length){
            let gerInv = true;
            let apprOrRej = true;
            rowStatus.map((item)=>{
                if(item != '1'){
                    gerInv = false;
                }
                if(item != '0'){
                    apprOrRej = false;
                }
            })
            if(gerInv){
                this.setState({
                    showGenerateInvoiveOption:true,
                    showApproveOrRejectOption:false
                })
            };
            if(apprOrRej){
                this.setState({
                    showGenerateInvoiveOption:false,
                    showApproveOrRejectOption:true
                })
            }
        }else{
            this.setState({
                showGenerateInvoiveOption:false,
                showApproveOrRejectOption:false
            })
        }
        
        this.setState({
            selectedRowKeys:selectedRowKeys,
            selectedRows:selectedRows,
            totalInvoiceAmount:totalInvoiceAmount
        })
    }

    cleanSelectedRows = () => {
        this.selectTableRow([],[])
        this.setState({
            selectedRows:[],
            totalInvoiceAmount:[]
        })
    }

    cancelGenerate = () => {
        this.setState({ invoiceModalvisible: false });
    }

    createInvoice = () => {
        const form = this.formRef.props.form;
        form.validateFields((err, values) => {
          if (err) {
            return;
          }
          console.log('Received values of form: ', values);
          form.resetFields();
          this.setState({ invoiceModalvisible: false });
        });
    }

    saveFormRef = (formRef) => {
        this.formRef = formRef;
    }

    searchEmployeeOrAdvAccount = (type,value) => {
        if(type === 'advAccount'){
            this.tableQueryReplace({advAccountId:null});
            this.setState({
                advAccountValue:value,
            })
            this.props.dispatch({
                type:'advReport/fetchAdvAccount',
                payload: {
                    keyWord: value,
                },
            });
        }else{
            this.tableQueryReplace({employeeId:null});
            this.setState({
                employeeValue:value,
            })
            this.props.dispatch({
                type:'advReport/fetchEmployee',
                payload: {
                    role:this.state.employeeRole,
                    keyWord: value,
                },
            });
        }
    }

    selectEmployeeOrAdvAccount = (type,value) => {
        if(type === 'advAccount'){
            this.tableQueryReplace({advAccountId:value});
            this.setState({
                advAccountValue:value
            });
        }else{
            this.tableQueryReplace({employeeId:value});
            this.setState({
                employeeValue:value,
            });
        }
    }

    tableQueryReplace = (childObj) =>{
        let data = Object.assign({}, this.state.tableQuery, childObj);
        this.setState({
            tableQuery: data
        });
    }

    changeEmployeeRole = (value) => {
        this.setState({
            employeeRole:value
        })
    }

    pageSizeChange = (current, pageSize) => {
        this.setState({
            pageSize:pageSize,
            pageCurrent:1
        },function(){
            this.props.dispatch({
                type: 'advStatement/fetch',
                payload:{
                   ...this.state.tableQuery,
                   pageSize:this.state.pageSize,
                   pageCurrent:this.state.pageCurrent
                }
            });
        });
    }

    pageChange = (page, pageSize) => {
        this.setState({
            pageCurrent:page
        },function(){
            this.props.dispatch({
                type: 'advStatement/fetch',
                payload:{
                   ...this.state.tableQuery,
                   pageSize:this.state.pageSize,
                   pageCurrent:this.state.pageCurrent
                }
            });
        })
    }

    clearQuery = () => {
        this.props.form.resetFields();
        this.props.dispatch({
            type:'advReport/clearEmployeeAndAdvAccount'
        });
        this.setState({
            tableQuery:{
                advAccountId:null,
                employeeId:null,
                month:'',
                keyWords:''
            },
            advAccountValue:'',
            employeeValue:'',
            employeeRole:"1",
            pageCurrent:1,
        },function(){
            this.props.dispatch({
                type: 'advStatement/fetch',
                payload:{
                    ...this.state.tableQuery,
                    pageCurrent:this.state.pageCurrent,
                    pageSize:this.state.pageSize
                }
            });
        })
    }

    //表格输入invoiceAmount
    inputInvoiceAmount = (index,e) => {
        let tempInvoiceAmount = this.state.invoiceAmount;
        tempInvoiceAmount[index] = e.target.value;
        this.setState({
            invoiceAmount:tempInvoiceAmount
        })
    }

    sureInvoiceAmount = (index,record) => {
        console.log(this.state.invoiceAmount[index]);
        record.invoiceAmount = this.state.invoiceAmount[index];
        const {dataList} = this.props.advStatement;
        let tempDataList = deepCloneObj(dataList);
        tempDataList.forEach(function(item,ind){
            if(item.uniqueKey==record.uniqueKey){
                tempDataList.splice(ind,1,record);
            }
        });
        this.props.dispatch({
            type:'advStatement/asyncDataList',
            payload: tempDataList,
        })
    }

    selectCellCurrency = (index,value) => {
        let tempCellCurrency = this.state.cellCurrency;
        tempCellCurrency[index] = value;
        this.setState({
            cellCurrency:tempCellCurrency
        })
    }

    sureCellCurrency = (index) => {
        console.log(this.state.cellCurrency[index]);
    }

    selectCellApprove = (index,value) => {
        let tempCellApprove = this.state.cellApprove;
        tempCellApprove[index] = value;
        this.setState({
            cellApprove:tempCellApprove
        });
    }

    sureCellApprove = (index) => {
        console.log(this.state.cellApprove[index]);
    }

    render() {
        const {selectedRowKeys,selectedRows,totalInvoiceAmount } = this.state;
        const {employeeList,advAccountList} = this.props.advReport;
        const {dataList,total,pageSize,pageCurrent} = this.props.advStatement;
        const { getFieldDecorator } = this.props.form;
        const {loading} = this.props;
        const rowSelection = {
            selectedRowKeys:selectedRowKeys,
            onChange:this.selectTableRow,
            getCheckboxProps:(record)=>{
                return {disabled:(record.finApproStatus == '3' || record.finApproStatus == '2')}
            }
        };
        const userRole = localStorage.getItem('antd-pro-authority');
        const columns = [{
            title: 'Campaign',
            dataIndex: 'id',
            render: (text,record) => {
                return <span>{text+"-"+record.name}</span>
            }
        },{
            title: 'Invoice Amount',
            dataIndex: 'invoiceAmount',
            render:(text,record,index) => {
                if(!text){
                    if(userRole == 'admin'){
                        return  <div>
                                    <Input value={this.state.invoiceAmount[index]} 
                                        onChange={this.inputInvoiceAmount.bind(this,index)}
                                        size="small"
                                        style={{width:80,marginRight:5}}
                                    />
                                    <Button 
                                        type='primary' size="small" 
                                        onClick={this.sureInvoiceAmount.bind(this,index,record)}>
                                        Sure
                                    </Button>
                                </div> 
                    }else{
                        return ''
                    }
                }else{
                    return text;
                }
                
            }
        },{
            title: 'Currency',
            dataIndex: 'currency',
            render:(text,record,index) => {
                if(!text){
                    if(userRole == 'admin'){
                        return (
                            <div>
                                <Select size="small" defaultValue="USD" style={{ width: 80,marginRight:5 }} onChange={this.selectCellCurrency.bind(this,index)}>
                                    <Option value="USD">USD</Option>
                                    <Option value="INR">INR</Option>
                                </Select>
                                <Button type='primary' size='small' onClick={this.sureCellCurrency.bind(this,index)}>Sure</Button>
                            </div>
                        )
                    }else{
                        return '';
                    }
                }else{
                    return text;
                }
            }
        },{
            title: 'Deducted Conv.',
            dataIndex: 'deductedConv',
        },{
            title: 'Deducted Amt.',
            dataIndex: 'deductedAmt',
        },{
            title: 'Finance Approve',
            dataIndex: 'finApproStatus',
            render:(text,record,index) => {
                if(text == '0'){
                    if(userRole == 'admin'){
                        return(
                            <div>
                                <Select size="small" defaultValue="1" style={{ width: 100,marginRight:5 }} onChange={this.selectCellApprove.bind(this,index)}>
                                    <Option value="1">Approve</Option>
                                    <Option value="2">Reject</Option>
                                </Select>
                                <Button type='primary' size='small' onClick={this.sureCellApprove.bind(this,index)}>Sure</Button>
                            </div>
                        ) 
                    }else{
                        return <div><Badge status="processing"/>Pending-Audit</div>
                    }
                }else if(text == '1'){
                    return <div><Badge status="success"/>Approved</div>
                }else if(text == '2'){
                    return <div><Badge status="error"/>Rejected</div>
                }else{
                    return <div><Badge status="default"/>Invoiced</div>
                }
            }
        },{
            title: 'Move to',
            dataIndex: 'month',
        }];
        return (
            <div>
                <PageHeaderLayout>
                    <Card bordered={false}>
                    <div className={commonStyle.searchFormWrapper}>
                    <Form layout="inline" onSubmit={this.submitSearch}>
                        <Row>
                            <Col sm={{span:12}} xs={{span:24}}> 
                                <FormItem label="Customer">
                                    {getFieldDecorator('keyWords')(
                                        <Input placeholder="Search by code or key word" autoComplete="off"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col sm={{span:12}} xs={{span:24}}> 
                                <FormItem label="Advertiser Account">
                                    <AutoComplete
                                        allowClear
                                        value={this.state.advAccountValue}
                                        dataSource={advAccountList}
                                        style={{ width: 230 }}
                                        onSelect={this.selectEmployeeOrAdvAccount.bind(this,'advAccount')}
                                        onSearch={this.searchEmployeeOrAdvAccount.bind(this,'advAccount')}
                                        placeholder="search advertiser account"
                                    />
                                </FormItem>
                            </Col>
                            <Col sm={{span:12}} xs={{span:24}}>
                                <FormItem label="Employee">
                                    <Select 
                                        value={this.state.employeeRole} 
                                        style={{ width: 100 }} 
                                        className={commonStyle.linkTypeSelect}
                                        onChange={this.changeEmployeeRole}
                                        >
                                        <Option value="1">Sales</Option>
                                        <Option value="0">PM</Option>
                                    </Select>
                                    <AutoComplete
                                        allowClear
                                        value={this.state.employeeValue}
                                        className={commonStyle.linkTypeAutoSelect}
                                        dataSource={employeeList}
                                        style={{ width: 230 }}
                                        onSelect={this.selectEmployeeOrAdvAccount.bind(this,'employee')}
                                        onSearch={this.searchEmployeeOrAdvAccount.bind(this,'employee')}
                                        placeholder="search employee"
                                    />
                                </FormItem>
                            </Col>
                            <Col sm={{span:12}} xs={{span:24}}>
                                <FormItem label="Date Range">
                                    <MonthPicker   
                                        value={this.state.tableQuery.month?moment(this.state.tableQuery.month):null} 
                                        onChange={this.dateRangeChange} 
                                    />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <div className={commonStyle.searchBtnWrapper}>
                                <Button type="primary" htmlType="submit">QUERY</Button>
                                <Button style={{marginLeft:'10px'}}  onClick={this.clearQuery}>RESET</Button>
                            </div>
                        </Row>
                        <Row>
                            <Col sm={{span:12}} xs={{span:24}}>
                            {
                                this.state.showGenerateInvoiveOption?(
                                    <FormItem label="Batch Actions">
                                    <Select style={{ width: 230 }} onChange={this.selectOption} placeholder="Choose and Apply">
                                        <Option value="3">Generate Invoice</Option>
                                    </Select>
                                    </FormItem>
                                ):null
                            }
                            {
                                this.state.showApproveOrRejectOption?(
                                    <FormItem label="Batch Actions">
                                        <Select style={{ width: 230 }} onChange={this.selectOption} placeholder="Choose and Apply">
                                            <Option value="1">Approve</Option>
                                            <Option value="2">Reject</Option>
                                        </Select>
                                    </FormItem>
                                ):null
                            }
                            </Col>
                        </Row>
                    </Form>
                    </div>
                    <Alert
                        style={{marginBottom:"5px"}}
                        message={
                        <Fragment>
                             Selected <a style={{ fontWeight: 600 }}>{selectedRows.length}</a> Campaigns&nbsp;&nbsp;
                            {totalInvoiceAmount.map((item,index)=> (
                            <span style={{ marginLeft: 8 }} key={index}>
                                Total Invoice Amount:&nbsp;
                                <span style={{ fontWeight: 600 }}>
                                    {item.total + " " +item.type}
                                </span>
                            </span>
                            ))}
                            {
                                totalInvoiceAmount.length?
                                <a onClick={this.cleanSelectedRows} style={{ marginLeft: 24 }}>
                                Clear Select
                                </a>:''
                            }
                        </Fragment>
                        }
                        type="info"
                        showIcon
                    />
                    <Table 
                        rowSelection={rowSelection}
                        columns={columns} 
                        dataSource={dataList} 
                        loading={loading}
                        pagination={{
                            defaultCurrent:1,
                            total:Number(total),
                            showSizeChanger:true,
                            pageSize:Number(pageSize),
                            pageSizeOptions:['10','20','30','50','100'],
                            onShowSizeChange:this.pageSizeChange,
                            current:Number(pageCurrent), 
                            onChange:this.pageChange
                        }}
                        rowKey="uniqueKey"
                        bordered
                    />
                    </Card>
                </PageHeaderLayout>
                <InvoiceModal
                    wrappedComponentRef={this.saveFormRef}
                    visible={this.state.invoiceModalvisible}
                    onCancel={this.cancelGenerate}
                    onCreate={this.createInvoice}
                />
            </div>
        )
    }
}