import { stringify } from 'qs';
import request from '../utils/request';

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function fakeAccountLogin(params) {
  return request('/api/login/account', {
    method: 'POST',
    body: params,
  });
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}

export async function queryadvReport(params) {
    return request(`/api/advReport?${stringify(params)}`);
}

export async function queryEmployee(params) {
    return request(`/api/employee?${stringify(params)}`);
}

export async function queryAdvAccount(params) {
    return request(`/api/advAccount?${stringify(params)}`);
}

export async function queryAdvStatement(params) {
    return request(`/api/advStatement?${stringify(params)}`);
}

export async function advStatementUpdates(id,params) {
    return request('/api/advStatement/'+id, {
        method: 'PUT',
        body: params,
    });
}

export async function advStatementUpdatesByData(params) {
    return request('/api/advStatement', {
        method: 'PUT',
        body: params,
    });
}

export async function queryAdvInvRecord(params) {
    return request(`/api/advInvRecord?${stringify(params)}`);
}

export async function deleteAdvInvRecord(id) {
    return request('/api/advInvRecord/'+id, {
        method: 'DELETE'
    });
}

export async function advInvRecordUpdate(id,params) {
    return request('/api/advInvRecord/'+id, {
        method: 'PUT',
        body:params
    });
}

export async function queryAdvPaymentColle(params) {
    return request(`/api/advPaymentColle?${stringify(params)}`);
}

export async function queryAdvCredit(params) {
    return request(`/api/advCredit?${stringify(params)}`);
}

//添加pub statement 的 Summary 接口
export async function queryPubStatementSummary(params) {
    return request(`/api/pubStatementSummary?${stringify(params)}`);
}

//PubStatement接口
export async function queryPubStatement(params) {
    return request(`/api/pubStatement?${stringify(params)}`);
}

//publisher invoice record接口
export async function queryPubInvRecord(params) {
    return request(`/api/pubInvRecord?${stringify(params)}`);
}

//publisher invoice 下的每条收款记录接口
export async function queryPubInvRecordInfo(id) {
    return request(`/api/pubInvRecord/${id}/record`);
}

//公用 智能搜索 campaign
export async function queryCampaign(params) {
    return request(`/api/campaign?${stringify(params)}`);
}

//公用 智能搜索 affiliate
export async function queryAffiliate(params) {
    return request(`/api/affiliate?${stringify(params)}`);
}
