import { Menu } from 'electron'

const template = [
  {
    label: '文件',
    submenu: [
      { label: '新建' }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
