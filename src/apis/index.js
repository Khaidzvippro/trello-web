import axios from 'axios'
import { API_ENDPOINT } from '~/utils/constants'

export const fetchBoardDetailsAPI = async (boardId) => {
  const response = await axios.get(`${API_ENDPOINT}/v1/boards/${boardId}`)
  //Lưu ý: axios sẽ trả về kết quả qua property của nó là data
  return response.data
}
