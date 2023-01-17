#include <iostream>
#include "GPM.h"
#define META_DATA_LENGTH 6



int main() {
  // 159.725
  Eigen::RowVector<double, META_DATA_LENGTH> arr{
      87.61666667, 98.5, 108.475, 118.41666667, 132.80833333, 145.40833333};
  GrayPredictModel<META_DATA_LENGTH> model(arr);
  model.Execute();

  std::cout << "灰色预测模型：" << std::endl;
  std::cout << "原数据:\n"<< model.get_meta_data() << std::endl;
  std::cout << "预测后数据:\n"<< model.get_preds_data() << std::endl;
  std::cout << "残差评估结果：" << GradeContent(model.get_residuals_grade()) << std::endl;
  std::cout << "级比评估结果：" << GradeContent(model.get_stages_grade()) << std::endl;
  std::cout << "级比偏差值评估结果：" << GradeContent(model.get_stage_offsets_grade()) << std::endl;
  std::cout << "目标数据：" << model.predict(META_DATA_LENGTH+1) << std::endl;
  return 0;
}