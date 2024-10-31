import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'
import { cloneDeep } from 'lodash'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board }) {
  //yêu cầu di chuyển 10px thì mới kích hoạt event, fix th click chuột gọi event
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 }
  })
  // nhấn giữ 250ms và dung sai cảm ứng 5px thì mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 10 }
  })

  const sensors = useSensors(mouseSensor, touchSensor)
  const [orderedColumns, setOrderedColumns] = useState([])

  // cùng 1 thời điểm chỉ có 1 phần tử đang được kéo (column or card)
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])
  //
  const findColumnByCardId = (cardId) => {
    return orderedColumns.find((column) =>
      column?.cards?.map((card) => card._id)?.includes(cardId)
    )
  }

  // Trigger khi bắt đầu drag 1 phần tử
  const handleDragStart = (event) => {
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(
      event?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    )
    setActiveDragItemData(event?.active?.data?.current)
  }
  // Trigger trong quá trình kéo
  const handleDragOver = (event) => {
    // Không làm gì thêm nếu như kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    // Nếu kéo card thì xử lí để kéo card qua lại các column
    const { active, over } = event

    // kiểm tra nếu ko tồn tại active hoặc over( kéo linh tinh ra ngoài thì return luôn tránh lỗi)
    if (!active || !over) return
    // activeDrangingCardId là card đang được kéo
    const {
      id: activeDrangingCardId,
      data: { current: activeDrangingCardData }
    } = active
    // overCardId là card đang tương tác với card đang được kéo
    const { id: overCardId } = over

    // Tìm 2 column của 2 card đang được kéo theo cardId
    const activeColumn = findColumnByCardId(activeDrangingCardId)
    const overColumn = findColumnByCardId(overCardId)
    // neu ko ton tai
    if (!activeColumn || !overColumn) return
    // chỉ xử lý nếu kéo ở 2 column khác nhau, vì đây là đang xử lý kéo thôi
    if (activeColumn._id !== overColumn._id) {
      setOrderedColumns((prevColumns) => {
        const overCardIndex = overColumn?.cards?.findIndex(
          (card) => card._id === overCardId
        )
        // Logic tính toán cho "cardIndex mới"
        let newCardIndex
        const isBelowOverItem =
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height

        const modifier = isBelowOverItem ? 1 : 0

        newCardIndex =
          overCardIndex >= 0
            ? overCardIndex + modifier
            : overColumn?.cards?.length + 1

        const nextColumns = cloneDeep(prevColumns)
        const nextActiveColumn = nextColumns.find(
          (column) => column._id === activeColumn._id
        )
        const nextOverColumn = nextColumns.find(
          (column) => column._id === overColumn._id
        )
        // column cũ
        if (nextActiveColumn) {
          // Xóa card ở column cũ (kéo card sang cột khác thì xóa card cột cũ đi)
          nextActiveColumn.cards = nextActiveColumn.cards.filter(
            (card) => card._id !== activeDrangingCardId
          )
          // Cập nhật lại mảng cardOderIds cho chuẩn dữ liệu
          nextActiveColumn.columnOrderIds = nextActiveColumn.cards.map(
            (card) => card._id
          )
        }
        // column mới
        if (nextOverColumn) {
          // Kiểm tra xem card đang kéo có tồn tại ở overColum hay chưa, nếu có thì cần xóa nó trước
          nextOverColumn.cards = nextOverColumn.cards.filter(
            (card) => card._id !== activeDrangingCardId
          )
          // Thêm card đang kéo vào overColumn theo vị trí Index mới
          nextOverColumn.cards = nextOverColumn.cards.toSpliced(
            newCardIndex,
            0,
            activeDrangingCardData
          )
          // Cập nhật lại mảng cardOderIds cho chuẩn dữ liệu
          nextOverColumn.columnOrderIds = nextActiveColumn.cards.map(
            (card) => card._id
          )
        }

        return nextColumns
      })
    }
  }
  // Trigger khi drop
  const handleDragEnd = (event) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      console.log('hanh dong keo tha card: ')
      return
    }

    const { active, over } = event
    // kiểm tra nếu ko tồn tại over( kéo thả ra ngoài thì return luôn tránh lỗi)
    if (!over) return
    //nếu vị trí sau khi kéo thả khác vị trí ban đầu
    if (active.id !== over.id) {
      //lay vi tri cu tu active
      const oldIndex = orderedColumns.findIndex((c) => c._id === active.id)
      //lay vi tri moi tu over
      const newIndex = orderedColumns.findIndex((c) => c._id === over.id)
      //
      const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex)
      // const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id)

      // cập nhật lại state columns ban đầu sau khi đã kéo thả
      setOrderedColumns(dndOrderedColumns)
    }

    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
  }
  //
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  }
  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      sensors={sensors}
      collisionDetection={closestCorners}
    >
      <Box
        sx={{
          width: '100%',
          height: (theme) => theme.trello.boardContentHeight,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? '#596275' : '#9c9fc9',
          p: '10px 0'
        }}
      >
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
            <Column column={activeDragItemData} />
          )}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
            <Card card={activeDragItemData} />
          )}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}
export default BoardContent
