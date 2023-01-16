import math
import numpy as np

class TOPSIS:
    def __init__(self,matrix:np.ndarray,description:list,weight:list) -> None:
        self._matrix_ = matrix
        self._description_ = description
        self._weight_ = weight
        self.finalScore = None
    # 对矩阵进行处理 归一化
    def vectorNorm(self):
        for i in range(len(self._description_)):
            if type(self._description_[i]) == tuple:
                self._matrix_[:,i] = self._proc_interval(self._matrix_[:,i],self._description_[i])  
                self._description_[i] = "bene"        
            elif self._description_[i] != "cost" and self._description_[i] != "bene":
                return False
            self._matrix_[:,i] = self._proc_norm(self._matrix_[:,i] , self._weight_[i])
        print("*————————————————————————————————————————————————————————————————————————————*")
        print("归一化结果：\n",self._matrix_)
    def _proc_norm(self,attr,weight):
        mot = math.sqrt(sum(attr*attr))
        res = []
        for i in attr:
            res.append((i/mot)*weight)
        return res;
    def _proc_interval(self,data,interval):
        res = []
        for i in data:
            res.append(self.__proc_single_interval(i,interval[0],interval[1]))
        return res
    def __proc_single_interval(self,dataInt:float or int,perf_interval,loose_interval)->float:
        if dataInt <= loose_interval[0] or dataInt >= loose_interval[1]:
            return 0
        elif dataInt>= loose_interval[0] and dataInt<= perf_interval[0]:
            return 1-((perf_interval[0]-dataInt)/(perf_interval[0]-loose_interval[0]))
        elif dataInt<= loose_interval[1] and dataInt>= perf_interval[1]:
            return 1-((dataInt-perf_interval[1])/(loose_interval[1]-perf_interval[1]))
        else:
            return 1
    def findExtreme(self):
        posi = []
        nega = []
        for i in range(len(self._description_)):
            if self._description_[i] == "cost":
                posi.append(min(self._matrix_[:,i]))
                nega.append(max(self._matrix_[:,i]))
            else:
                posi.append(max(self._matrix_[:,i]))
                nega.append(min(self._matrix_[:,i]))
        self.posi = np.array(posi)
        self.nega = np.array(nega)
        print("*————————————————————————————————————————————————————————————————————————————*")
        print("正负理想解：\n",posi,"\n",nega)
    def createTopsisList(self):
        res = []
        for i in self._matrix_:
            # 计算距离
            pos_des = math.sqrt(sum((i-self.posi)**2))
            neg_des = math.sqrt(sum((i-self.nega)**2))
            res.append(neg_des/(neg_des+pos_des))
        self.finalScore = res
        print("*————————————————————————————————————————————————————————————————————————————*")
    # 主要逻辑函数
    def Execute(self):
        if self.finalScore == None:
            # 向量规范化
            if self.vectorNorm() == False:
                return "ERROR"
            # 找正负最优解
            self.findExtreme()
            # 获得成绩列表
            self.createTopsisList()
            return self.finalScore
        else:
            return self.finalScore

class GrayPredictModel:
    def __init__(self,meta_data) -> None:
        self.data = meta_data
        self.predictable = False
    def Execute(self):
        if self.grayCheck():
            self.grayGenerateModel()
            self.grayEvaluate()
            self.predictable = True
    def predict(self,index):
        # 检查是否进行了构建
        if (self.predictable == False):
            return np.nan
        else:
            return (self.data[0] - self.params[1]/self.params[0])*(1-math.exp(self.params[0]))*math.exp(-self.params[0]*(index-1))
            
    def grayCheckInterval(self):
        return (math.exp(-2 / (len(self.data)+1)),math.exp(2 / (len(self.data)+1)))
    def grayCheck(self):
        print("*————————————————————————————————————————————————————————————————————————————*")
        # 生成范围tuple
        limit = self.grayCheckInterval()
        print("原始数列-级比可容覆盖区间",limit)
        # 计算级比
        stages = []
        for i in range(1,len(self.data)):
            stages.append(self.data[i-1]/self.data[i])
        self.stages = np.array(stages)
        # 比较
        if max(stages) < limit[1] and min(stages) > limit[0]:
            print("数据通过检查，可以进行灰色预测")
            return True
        else:
            print("数据未通过检查，不能进行灰色预测")
            return False
    def grayGenerateModel(self):
        len_data = len(self.data)
        print("*————————————————————————————————————————————————————————————————————————————*")
        # 累加生成
        data_agg = np.array([sum(self.data[0:i+1]) for i in range(len_data)])
        #计算数据矩阵B和数据向量Y
        B = np.zeros([len_data-1,2])
        Y = np.zeros([len_data-1,1])
        for i in range(0,len_data-1):
            B[i][0] = -0.5*(data_agg[i] + data_agg[i+1])
            B[i][1] = 1
            Y[i][0] = self.data[i+1]
        #计算GM(1,1)微分方程的参数a和b
        A = np.linalg.inv(B.T.dot(B)).dot(B.T).dot(Y)
        a_param = A[0][0]
        b_param = A[1][0]
        self.params = (a_param,b_param)
        print("GM(1,1)模型系数a=",a_param," b=",b_param)
        preds = np.zeros(len_data)
        preds[0] = self.data[0]
        for i in range(1,len_data):
            preds[i] = (self.data[0] - b_param/a_param)*(1-math.exp(a_param))*math.exp(-a_param*(i))
        print("预测后的原数据:\n",preds)
        self.preds = preds
    def grayEvaluate(self):
        print("*————————————————————————————————————————————————————————————————————————————*")
        # 残差计算
        residual = (self.data-self.preds)/self.data
        self.residual = residual
        print("预测残差序列：\n",residual)
        if max(abs(residual)) < 0.1:
            print("预测达到较高要求")
        elif max(abs(residual)) < 0.2:
            print("预测满足一般要求")
        else:
            print("预测不满足要求")
        # 级比偏差值
        stage_offs = 1- (1-0.5*self.params[0])*self.stages/(1+0.5*self.params[0])
        self.stage_offs = stage_offs
        print("级比偏差值序列：\n",stage_offs)
        if max(abs(stage_offs)) < 0.1:
            print("级比偏差值满足较高要求")
        elif max(abs(stage_offs)) < 0.2:
            print("级比偏差值满足一般要求")
        else:
            print("级比偏差值不满足要求")
        print("*————————————————————————————————————————————————————————————————————————————*")
        
class GrayEvaluateModel:
    def __init__(self,data,resolution=0.5) -> None:
        self.data = data
        self.resolution = resolution
        self.scheme = None
        self.arguments = None
    def Execute(self):
        if self.scheme == None and self.arguments == None:
            self.findExtreme()
            self.getGrayAbsArr()
            min_pos , max_pos = self.getExtremPos(self.abs_data)
            res = (min_pos + self.resolution*max_pos) / (self.abs_data + self.resolution*max_pos)
            self.scheme =  np.mean(res,axis=1)
            self.arguments = np.mean(res,axis=0)
    def getExtremPos(self,absarr):
        print("*————————————————————————————————————————————————————————————————————————————*")
        return np.min(absarr),np.max(absarr)
    def findExtreme(self):
        print("*————————————————————————————————————————————————————————————————————————————*")
        posi = []
        for i in range(len(self.data[0])):
            posi.append(max(self.data[:,i]))
        self.posi = np.array(posi)
        print("理想解：\n",self.posi)
    def getGrayAbsArr(self):
        print("*————————————————————————————————————————————————————————————————————————————*")
        res = np.zeros((len(self.data),len(self.data[0])))
        for i in range(len(self.data)):
            res[i] = np.abs(self.posi-self.data[i])
        self.abs_data = res
        print("绝对值差：\n",res)
        
